from app import views
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import MyTokenObtainPairView,ActivateAccountView
urlpatterns = [
    path('',views.getRoutes,name='getRoutes'),
    path('getProducts/',views.getProducts,name="getProducts"),
    path('getProduct/<str:id>',views.getProduct,name="getProduct"),
    path('users/login/',views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('users/register/',views.RegisterUser,name="register"),
    path("activate/<uidb64>/<token>/", ActivateAccountView.as_view(), name="activate"),
    path('orders/add/', views.addOrderItem, name='orders-add'),
    path('orders/',views.getOrders,name="orders"),
    path('orders/myorders/',views.getMyOrders,name='myorders'),
    path('orders/<str:pk>/',views.getOrderById,name='user-order'),

    #admin operation

    path('products/create/',views.createProduct,name="create-product"),
    path('products/update/<str:pk>/',views.updateProduct,name='update-product'),
    path('products/delete/<str:pk>/',views.deleteProduct,name='delete-product'),
    path('products/upload/',views.uploadImage,name='upload-image'),



    path('users/getallusers/',views.getUsers,name="get-users"),
    path('users/update/<str:pk>/',views.updateUsers,name='updateUsers'),
    path('users/delete/<str:pk>/',views.deleteUsers,name='deleteUsers'),
    path('users/<str:pk>/',views.getUsersById,name='getUsersById'),

   


]