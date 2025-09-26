from django.contrib.auth.backends import ModelBackend

class PasswordLoginDisabledBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        # Always deny password-based auth
        return None
