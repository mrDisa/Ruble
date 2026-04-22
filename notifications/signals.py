from django.db.models.signals import post_save
from django.dispatch import receiver

from posts.models import Like, Comment
from interactions.models import Follow
from notifications.models import Notification


@receiver(post_save, sender=Like)
def create_like_notification(sender, instance, created, **kwargs):
    if not created:
        return

    post = instance.post

    if post.author == instance.user:
        return

    key = f"like_post_{post.id}"

    notification, created = Notification.objects.get_or_create(
        user=post.author,
        type=Notification.NotificationType.LIKE,
        post=post,
        grouping_key=key,
        defaults={
            "actor": instance.user,
            "actor_count": 1
        }
    )

    if not created:
        notification.actor_count += 1
        notification.actor = instance.user
        notification.is_read = False
        notification.save()


@receiver(post_save, sender=Follow)
def create_follow_notification(sender, instance, created, **kwargs):
    if not created:
        return

    if instance.follower == instance.following:
        return

    key = f"follow_user_{instance.following.id}"

    notification, created = Notification.objects.get_or_create(
        user=instance.following,
        type=Notification.NotificationType.FOLLOW,
        grouping_key=key,
        defaults={
            "actor": instance.follower,
            "actor_count": 1
        }
    )

    if not created:
        notification.actor_count += 1
        notification.actor = instance.follower
        notification.is_read = False
        notification.save()

@receiver(post_save, sender=Comment)
def create_comment_notification(sender, instance, created, **kwargs):
    if not created:
        return

    post = instance.post

    if post.author == instance.author:
        return

    key = f"comment_post_{post.id}"

    notification, created = Notification.objects.get_or_create(
        user=post.author,
        type=Notification.NotificationType.COMMENT,
        post=post,
        grouping_key=key,
        defaults={
            "actor": instance.author,
            "actor_count": 1
        }
    )

    if not created:
        notification.actor_count += 1
        notification.actor = instance.author
        notification.is_read = False
        notification.save()