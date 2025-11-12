from django.urls import path
from . import views, views_drive

urlpatterns = [
    # Existing local storage endpoints
    path('nodes/', views.DriveNodeListCreateView.as_view(), name='drive_nodes'),
    path('nodes/<int:pk>/', views.DriveNodeRetrieveUpdateDeleteView.as_view(), name='drive_node_detail'),
    path('folders/<int:folder_id>/children/', views.DriveFolderChildrenView.as_view(), name='folder_children'),
    path('folders/create/', views.CreateFolderView.as_view(), name='create_folder'),
    path('files/upload/', views.UploadFileView.as_view(), name='upload_file'),
    path('path/<int:pk>/', views.NodePathView.as_view(), name='node_path'),
    
    # Google Drive endpoints
    path('drive/totalShared/',views_drive.total_shared_files,name='drive_total_shared'),
    path('drive/list/', views_drive.list_drive_files, name='drive_list_files'),
    path('drive/upload', views_drive.upload_to_drive, name='drive_upload'),
    path('drive/folder', views_drive.create_drive_folder, name='drive_create_folder'),
    path('drive/move/', views_drive.move_drive_file, name='drive_move_file'),
    path('drive/<str:file_id>/rename/', views_drive.rename_drive_file, name='drive_rename'),
    path('drive/<str:file_id>/download/', views_drive.download_drive_file, name='drive_download'),
    path('drive/<str:file_id>/', views_drive.delete_drive_file, name='drive_delete'),
    path('drive/<str:file_id>/shareable/',views_drive.share_drive_file, name='drive_make_shareable')
]
