from django.http import HttpResponse

def show(request):
    return HttpResponse("Hello, this is CTS application.")