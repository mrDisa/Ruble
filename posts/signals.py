from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Post

# === СИГНАЛ (ТРИГГЕР) ДЛЯ СОЗДАНИЯ УВЕДОМЛЕНИЙ ===
@receiver(post_save, sender=Post)
def create_notification_for_new_post(sender, instance, created, **kwargs):
    # Выводим в консоль сервера сообщение, чтобы понять, сработал ли сигнал
    print(f"\n--- [DEBUG] СИГНАЛ СРАБОТАЛ! Новый пост создан: {created} ---")
    
    if created:
        # Прячем импорты внутрь функции, чтобы избежать ошибки циклического импорта
        from interactions.models import Follow
        from notifications.models import Notification
        
        # 1. Находим всех подписчиков автора нового поста
        followers = Follow.objects.filter(following=instance.author)
        print(f"--- [DEBUG] Найдено подписчиков у автора {instance.author.username}: {followers.count()} ---")
        
        # 2. Формируем список уведомлений
        notifications = []
        for follow in followers:
            print(f"--- [DEBUG] Готовим уведомление для: {follow.follower.username} ---")
            notifications.append(
                Notification(
                    user=follow.follower,           # Кому летит уведомление (подписчику)
                    actor=instance.author,          # Кто виновник (автор поста)
                    type=Notification.NotificationType.NEW_POST, # Наш новый тип
                    post=instance                   # Прикрепляем сам пост
                )
            )
        
        # 3. Массово сохраняем в базу данных
        if notifications:
            Notification.objects.bulk_create(notifications)
            print("--- [DEBUG] Уведомления успешно сохранены в БД! ---\n")
        else:
            print("--- [DEBUG] Уведомлять некого (у автора нет подписчиков). ---\n")