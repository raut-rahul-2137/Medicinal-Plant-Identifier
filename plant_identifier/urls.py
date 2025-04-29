from django.urls import path
from . import views

urlpatterns = [
    path('', views.serve_react, name='serve_react'),
    path('api/predict/', views.predict, name='predict'),
] 