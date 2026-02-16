from rest_framework.response import Response
from django.shortcuts import render

from rest_framework.decorators import api_view,permission_classes
# from .products import products
from .serializer import ProductSerializer
from .serializer import UserSerializerWithTokens,OrderSerializer,OrderItemSerializer,ShippingAddressSerializer,UserSerializer
from .models import Product,Order,OrderItem,ShippingAddress
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_decode,urlsafe_base64_encode
from django.utils.encoding import force_bytes,force_text,DjangoUnicodeDecodeError
from django.core.mail import EmailMessage
from django.conf import settings
from django.views.generic import View
from .utils import TokenGenerator,generate_token
from rest_framework import status

@api_view(['GET'])
def getRoutes(request):
    myapi = [
        {
            "products": "/api/getProducts/",
            "product": "/api/getProduct/<1>/",
            "login":"/api/users/login/",
            "signUp":"/api/users/register"
        }
    ]
    return Response(myapi)

@api_view(['GET'])
def getProducts(request):
    products=Product.objects.all()
    serialize=ProductSerializer(products,many=True)
    return Response(serialize.data)

@api_view(['GET'])
def getProduct(request, id):

    product=Product.objects.get(_id=id)
    serialize=ProductSerializer(product,many=False)
    return Response(serialize.data)


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self,attrs):
        data=super().validate(attrs)
        serializer=UserSerializerWithTokens(self.user).data
        for k,v in serializer.items():
            data[k]=v
        return data



class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class=MyTokenObtainPairSerializer    



@api_view(['POST'])
def RegisterUser(request):
    data=request.data

    try:
        user=User.objects.create(first_name=data['fname'],
                                 last_name=data['lname'],username=data['email'],
                                 password=make_password(data['password']),
                                 email=data['email'],is_active=False)
        
        email_subject="Activate your account"
        message=render_to_string(
            "activate.html",{
                "user":user,
                "domain":"127.0.0.1:8000/",
                "uid":urlsafe_base64_encode(force_bytes(user.pk)),
                "token":generate_token.make_token(user)

            }
        )

        message={"details":f"To activate your profile click the given Link {message}"}
        return Response(message)
    

    except Exception as e:
        message={'details':f' sign in failed  {e}'}

        return Response(message)
    
class ActivateAccountView(View):
    def get(self,request,uidb64,token):
        try:
            uid=force_bytes(urlsafe_base64_decode(uidb64))
            user=User.objects.get(pk=uid)
        except Exception as identifier:
            user=None

        if user is not None and generate_token.check_token(user,token):
            user.is_active=True
            user.save()       
            return render(request,"activateSuccess.html") 
        else:
            return render(request,"activateFail.html")

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def addOrderItem(request):
    user=request.user
    data=request.data
    orderItems=data['orderItems']
    if orderItems and len(orderItems)==0:
        return Response({"detail":"No order items"},status=status.HTTP_400_BAD_REQUEST)
    
    order=Order.objects.create(
        user=user,
        # paymentMethod=data['paymentMethod'],
        paymentMethod="Cash on delivery",
        taxPrice=data['taxPrice'],
        shippingPrice=data['shippingPrice'],
        totalPrice=data['totalPrice']

    )

    shipping=ShippingAddress.objects.create(
        order=order,
        address=data['shippingAddress']['address'],
        city=data["shippingAddress"]["city"],
        postalCode=data["shippingAddress"]["postalCode"],
        country=data["shippingAddress"]["country"]
    )
    
    for i in orderItems:
        product=Product.objects.get(_id=i['product'])
        item=OrderItem.objects.create(
            product=product,
            order=order,
            name=product.name,
            qty=i['qty'],
            price=i['price'],
            image=product.image.url

        )

        product.countInStock-=item.qty
        product.save()

    serializer=OrderSerializer(order,many=False)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getOrders(request):
    orders=Order.objects.all()
    serializer=OrderSerializer(orders,many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getMyOrders(request):
    user=request.user
    orders=user.order_set.all()
    serializer=OrderSerializer(orders,many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getOrderById(request, pk):
    user = request.user

    try:
        order = Order.objects.get(_id=pk)
    except Order.DoesNotExist:
        return Response(
            {"detail": "Order not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    # allow admin OR owner
    if user.is_staff or order.user == user:
        serializer = OrderSerializer(order, many=False)
        return Response(serializer.data)
    else:
        return Response(
            {"detail": "Not authorized to view this order"},
            status=status.HTTP_403_FORBIDDEN
        )


@api_view(['POST'])
@permission_classes([IsAdminUser])
def createProduct(request):
    user=request.user

    product=Product.objects.create(
        user=user,
        name='sample Name',
        brand='sample brand',
        category='sample',
        price=0,
        countInStock=0,
        description=''
    )
    serializer=ProductSerializer(product,many=False)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def updateProduct(request,pk):
    data=request.data
    product=Product.objects.get(_id=pk)
    product.name=data['name']
    product.price=data['price']
    product.brand=data['brand']
    product.category=data['category']
    product.countInStock=data['countInStock']
    product.description=data['description']
    product.save()
    serializer=ProductSerializer(product,many=False)
    return Response(serializer.data)

@api_view(['POST'])
def uploadImage(request):
    data=request.data
    product_id=data['product_id']
    product=Product.objects.get(_id=product_id)
    product.image=request.FILES.get('image')
    product.save()
    return Response('image uploaded successfully')

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def deleteProduct(request,pk):
    product=Product.objects.get(_id=pk)
    product.delete()
    return Response('product deleted successfully')

@api_view(['GET'])
@permission_classes([IsAdminUser])
def getUsers(request):
    users=User.objects.all()
    serializer=UserSerializer(users,many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def getUsersById(request, pk):
    try:
        user = User.objects.get(id=pk)
        serializer = UserSerializer(user, many=False)
        return Response(serializer.data)       # ✅ FIXED
    except User.DoesNotExist:
        return Response({"detail": "User not found"}, status=404)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def deleteUsers(request,pk):
    user=User.objects.get(id=pk)
    user.delete()
    return Response("user deleted")
    

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateUsers(request, pk):
    try:
        user = User.objects.get(id=pk)        
        data = request.data

        user.first_name = data.get('name', user.first_name)
        user.email = data.get('email', user.email)
        user.is_staff = data.get('isAdmin', user.is_staff)

        user.save()

        serializer = UserSerializer(user, many=False)
        return Response(serializer.data)       

    except User.DoesNotExist:
        return Response({"detail": "User not found"}, status=404)


        