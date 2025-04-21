from django.urls import path
from .views import task_list_create, task_update_delete

urlpatterns = [
    path('/', task_list_create),
    path('<uuid:pk>/', task_update_delete),
]