import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'api_client.dart';
import 'models.dart';

abstract interface class TokenStorage {
  Future<String?> read();
  Future<void> write(String token);
  Future<void> delete();
}

class SecureTokenStorage implements TokenStorage {
  const SecureTokenStorage();

  static const _storage = FlutterSecureStorage();
  static const _key = 'creno_access_token';

  @override
  Future<String?> read() => _storage.read(key: _key);

  @override
  Future<void> write(String token) => _storage.write(key: _key, value: token);

  @override
  Future<void> delete() => _storage.delete(key: _key);
}

class AuthController extends ChangeNotifier {
  AuthController(this.api, {TokenStorage? storage})
    : storage = storage ?? const SecureTokenStorage();

  final ApiClient api;
  final TokenStorage storage;

  AppUser? user;
  String? token;
  bool isLoading = true;
  String? restoreError;

  bool get isAuthenticated => user != null && token != null;

  Future<void> restoreSession() async {
    try {
      final storedToken = await storage.read();
      if (storedToken != null) {
        final response = await api.request('/auth/me', token: storedToken);
        token = storedToken;
        user = AppUser.fromJson(response['user'] as Map<String, dynamic>);
      }
    } on ApiException catch (error) {
      restoreError = error.message;
      if (error.statusCode == 401) {
        await storage.delete();
      }
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> signIn(String email, String password) async {
    final response = await api.request(
      '/auth/login',
      method: 'POST',
      body: {'email': email, 'password': password},
    );
    final accessToken = response['accessToken'] as String;
    final signedInUser = AppUser.fromJson(
      response['user'] as Map<String, dynamic>,
    );
    await storage.write(accessToken);
    token = accessToken;
    user = signedInUser;
    restoreError = null;
    notifyListeners();
  }

  Future<void> signUp({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
  }) async {
    await api.request(
      '/auth/register',
      method: 'POST',
      body: {
        'firstName': firstName,
        'lastName': lastName,
        'email': email,
        'password': password,
        'role': 'USER',
      },
    );
    await signIn(email, password);
  }

  Future<void> signOut() async {
    await storage.delete();
    token = null;
    user = null;
    notifyListeners();
  }
}
