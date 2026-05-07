from rest_framework import serializers
from users.models import User
from interactions.models import Follow  # Импортируем модель подписок

class UserSerializer(serializers.ModelSerializer):
    # Добавляем динамические поля
    is_followed = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        # Добавляем новые поля в список
        fields = [
            'id', 'username', 'first_name', 'email', 'password', 
            'job', 'bio', 'avatar', 'rank', 'is_followed', 'followers_count'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'job': {'required': False},
            'bio': {'required': False},
            'rank': {'read_only': True},
        }

    # Логика проверки: подписан ли текущий пользователь на этого юзера
    def get_is_followed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Проверяем наличие записи в таблице Follow
            return Follow.objects.filter(follower=request.user, following=obj).exists()
        return False

    # Логика подсчета: сколько людей подписано на этого юзера
    def get_followers_count(self, obj):
        return Follow.objects.filter(following=obj).count()
        
    def create(self, validated_data):
        # Твоя оригинальная логика создания пользователя
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        # Сохраняем дополнительные поля, если они переданы
        user.first_name = validated_data.get('first_name', '')
        user.job = validated_data.get('job', '')
        user.bio = validated_data.get('bio', '')
        if 'avatar' in validated_data:
            user.avatar = validated_data['avatar']
            
        user.save()
        return user