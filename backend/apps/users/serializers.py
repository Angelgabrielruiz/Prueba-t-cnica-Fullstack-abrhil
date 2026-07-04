from django.db import IntegrityError
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserSummarySerializer(serializers.ModelSerializer):
    # `name` reutiliza first_name de AbstractUser: el frontend pide "Nombre" en el
    # registro, no un username separado, así que no se justifica un campo nuevo.
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "name"]
        read_only_fields = fields

    def get_name(self, obj):
        return obj.first_name or obj.username


class RegisterSerializer(serializers.ModelSerializer):
    name = serializers.CharField(write_only=True, max_length=150)
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ["id", "name", "email", "password"]

    def create(self, validated_data):
        # El UniqueValidator de DRF sobre `email` es un check-then-insert, no atómico:
        # dos registros concurrentes con el mismo correo pueden pasar la validación
        # ambos y competir en el INSERT. Sin este try/except, el segundo revienta con
        # un IntegrityError sin capturar (500) en vez de un 400 legible.
        try:
            return User.objects.create_user(
                username=validated_data["email"],
                email=validated_data["email"],
                first_name=validated_data["name"],
                password=validated_data["password"],
            )
        except IntegrityError:
            raise serializers.ValidationError(
                {"email": "Ese correo ya está registrado."}
            )
