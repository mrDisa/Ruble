from rest_framework import serializers
from users.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # Добавляем все наши поля из модели
        fields = ['id', 'username', 'first_name', 'email', 'password', 'job', 'bio', 'avatar', 'rank']
        extra_kwargs = {
            'password': {'write_only': True},
            'job': {'required': False},
            'bio': {'required': False},
            'rank': {'read_only': True},
        }
    
        
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        # Если при регистрации передаются доп. поля, можно их сохранить тут
        user.first_name = validated_data.get('first_name', '')
        user.save()
        return user