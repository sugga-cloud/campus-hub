from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import DriveNode
from .serializers import DriveNodeSerializer


# 🔹 List all nodes (for logged-in user) OR create new node
class DriveNodeListCreateView(generics.ListCreateAPIView):
    serializer_class = DriveNodeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DriveNode.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


# 🔹 Retrieve / Update / Delete node by ID
class DriveNodeRetrieveUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DriveNodeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DriveNode.objects.filter(owner=self.request.user)


# 🔹 Get all children of a folder
class DriveFolderChildrenView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, folder_id):
        folder = get_object_or_404(DriveNode, id=folder_id, owner=request.user, is_folder=True)
        children = folder.children.all()
        serializer = DriveNodeSerializer(children, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# 🔹 Create a new folder
class CreateFolderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        name = request.data.get('name')
        parent_id = request.data.get('parent_id')

        parent = None
        if parent_id:
            parent = get_object_or_404(DriveNode, id=parent_id, owner=request.user)

        folder = DriveNode.objects.create(
            name=name,
            is_folder=True,
            parent=parent,
            owner=request.user
        )

        return Response(DriveNodeSerializer(folder).data, status=status.HTTP_201_CREATED)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from .models import DriveNode
from .serializers import DriveNodeSerializer
from .utils.google_drive import get_drive_service, upload_to_drive
import tempfile

class UploadFileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        name = request.data.get('name')
        parent_id = request.data.get('parent_id')
        uploaded_file = request.FILES.get('file')

        if not uploaded_file:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        # Find parent folder (if exists)
        parent = None
        parent_drive_id = None
        if parent_id:
            parent = get_object_or_404(DriveNode, id=parent_id, owner=request.user)
            parent_drive_id = parent.drive_file_id

        # Save the file temporarily
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            for chunk in uploaded_file.chunks():
                temp_file.write(chunk)
            temp_file_path = temp_file.name

        # Upload to Google Drive
        try:
            service = get_drive_service(request.user)
            drive_file = upload_to_drive(service, temp_file_path, name, uploaded_file.content_type, parent_drive_id)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Save metadata in your database
        node = DriveNode.objects.create(
            name=drive_file['name'],
            is_folder=False,
            drive_file_id=drive_file['id'],
            mime_type=drive_file['mimeType'],
            web_view_link=drive_file['webViewLink'],
            size=drive_file.get('size'),
            parent=parent,
            owner=request.user
        )

        return Response(DriveNodeSerializer(node).data, status=status.HTTP_201_CREATED)

# 🔹 Get full path of a node
class NodePathView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        node = get_object_or_404(DriveNode, id=pk, owner=request.user)
        path = node.get_path()
        return Response({'path': path}, status=status.HTTP_200_OK)
