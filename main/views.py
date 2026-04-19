from django.shortcuts import render

def mainView(request):
    return render(request, 'main/base.html')    
