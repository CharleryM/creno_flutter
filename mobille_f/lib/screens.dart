import 'package:flutter/material.dart';
import 'package:flutter_stripe/flutter_stripe.dart' hide Card;

import 'app_config.dart';
import 'api_client.dart';
import 'auth_controller.dart';
import 'models.dart';

const _lime = Color(0xFFC7FF3D);
const _ink = Color(0xFF111111);
const _muted = Color(0xFF737373);

String formatPrice(int cents) =>
    '${(cents / 100).toStringAsFixed(2).replaceAll('.', ',')} €';

String formatCourseDate(DateTime value) {
  const weekdays = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];
  const months = [
    'janv.',
    'févr.',
    'mars',
    'avr.',
    'mai',
    'juin',
    'juil.',
    'août',
    'sept.',
    'oct.',
    'nov.',
    'déc.',
  ];
  final date = value.toLocal();
  final weekday = weekdays[date.weekday - 1];
  final month = months[date.month - 1];
  final hour = date.hour.toString().padLeft(2, '0');
  final minute = date.minute.toString().padLeft(2, '0');
  return '$weekday ${date.day} $month à $hour:$minute';
}

Future<void> _push(BuildContext context, Widget page) async {
  await Navigator.of(
    context,
  ).push<void>(MaterialPageRoute<void>(builder: (_) => page));
}

void _replace(BuildContext context, Widget page) {
  Navigator.of(
    context,
  ).pushReplacement(MaterialPageRoute<void>(builder: (_) => page));
}

class _ActionButton extends StatelessWidget {
  const _ActionButton({
    required this.label,
    required this.onPressed,
    this.loading = false,
    this.outlined = false,
    this.enabled = true,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool loading;
  final bool outlined;
  final bool enabled;

  @override
  Widget build(BuildContext context) => SizedBox(
    width: double.infinity,
    child: outlined
        ? OutlinedButton(
            onPressed: enabled && !loading ? onPressed : null,
            style: OutlinedButton.styleFrom(
              foregroundColor: _ink,
              padding: const EdgeInsets.symmetric(vertical: 16),
              side: const BorderSide(color: Color(0xFFD4D4D4)),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
          )
        : FilledButton(
            onPressed: enabled && !loading ? onPressed : null,
            style: FilledButton.styleFrom(
              backgroundColor: _lime,
              foregroundColor: _ink,
              disabledBackgroundColor: const Color(0xFFE5E5E5),
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: loading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : Text(
                    label,
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),
          ),
  );
}

class _Field extends StatelessWidget {
  const _Field({
    required this.label,
    required this.controller,
    this.hint,
    this.keyboardType,
    this.obscure = false,
    this.multiline = false,
  });

  final String label;
  final TextEditingController controller;
  final String? hint;
  final TextInputType? keyboardType;
  final bool obscure;
  final bool multiline;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 18),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Text(
            label,
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
        ),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          obscureText: obscure,
          maxLines: multiline ? 4 : 1,
          textCapitalization: keyboardType == TextInputType.emailAddress
              ? TextCapitalization.none
              : TextCapitalization.sentences,
          decoration: InputDecoration(hintText: hint),
        ),
      ],
    ),
  );
}

class _ErrorBox extends StatelessWidget {
  const _ErrorBox(this.message);

  final String message;

  @override
  Widget build(BuildContext context) => Container(
    width: double.infinity,
    margin: const EdgeInsets.only(top: 16),
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(
      color: const Color(0xFFFEF2F2),
      borderRadius: BorderRadius.circular(12),
    ),
    child: Text(message, style: const TextStyle(color: Color(0xFFB91C1C))),
  );
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, required this.auth});

  final AuthController auth;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Course> _courses = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadCourses();
  }

  Future<void> _loadCourses() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final response = await widget.auth.api.request('/courses');
      final courses = (response['courses'] as List<dynamic>)
          .map((item) => Course.fromJson(item as Map<String, dynamic>))
          .toList();
      if (mounted) setState(() => _courses = courses);
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    body: SafeArea(
      child: RefreshIndicator(
        onRefresh: _loadCourses,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 22, 24, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'CRÉNO',
                          style: TextStyle(
                            fontSize: 30,
                            fontWeight: FontWeight.w900,
                            letterSpacing: -1,
                          ),
                        ),
                        AnimatedBuilder(
                          animation: widget.auth,
                          builder: (context, _) => TextButton(
                            onPressed: () => _push(
                              context,
                              widget.auth.user == null
                                  ? LoginScreen(auth: widget.auth)
                                  : AccountScreen(auth: widget.auth),
                            ),
                            style: TextButton.styleFrom(
                              backgroundColor: const Color(0xFFF5F5F5),
                              foregroundColor: _ink,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 12,
                              ),
                            ),
                            child: Text(
                              widget.auth.user?.firstName ?? 'Se connecter',
                              style: const TextStyle(
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 28),
                    const Text(
                      'Cours disponibles',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Réserve une place dans un studio près de chez toi.',
                      style: TextStyle(
                        color: _muted,
                        fontSize: 16,
                        height: 1.4,
                      ),
                    ),
                    if (widget.auth.restoreError != null)
                      _ErrorBox(widget.auth.restoreError!),
                  ],
                ),
              ),
            ),
            if (_loading)
              const SliverFillRemaining(
                hasScrollBody: false,
                child: Center(child: CircularProgressIndicator()),
              )
            else if (_error != null)
              SliverFillRemaining(
                hasScrollBody: false,
                child: _MessageState(
                  title: 'Impossible de charger les cours',
                  message: _error!,
                  action: _ActionButton(
                    label: 'Réessayer',
                    onPressed: _loadCourses,
                  ),
                ),
              )
            else if (_courses.isEmpty)
              const SliverFillRemaining(
                hasScrollBody: false,
                child: _MessageState(
                  title: 'Aucun cours disponible',
                  message: 'Les prochains créneaux apparaîtront ici.',
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(24, 0, 24, 28),
                sliver: SliverList.builder(
                  itemCount: _courses.length,
                  itemBuilder: (context, index) => _CourseCard(
                    course: _courses[index],
                    onTap: () => _push(
                      context,
                      CourseDetailsScreen(
                        courseId: _courses[index].id,
                        auth: widget.auth,
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    ),
  );
}

class _MessageState extends StatelessWidget {
  const _MessageState({
    required this.title,
    required this.message,
    this.action,
  });

  final String title;
  final String message;
  final Widget? action;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.all(28),
    child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          title,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 8),
        Text(
          message,
          textAlign: TextAlign.center,
          style: const TextStyle(color: _muted),
        ),
        if (action != null) ...[const SizedBox(height: 24), action!],
      ],
    ),
  );
}

class _CourseCard extends StatelessWidget {
  const _CourseCard({required this.course, required this.onTap});

  final Course course;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Card(
    margin: const EdgeInsets.only(bottom: 14),
    elevation: 0,
    color: Colors.white,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(18),
      side: const BorderSide(color: Color(0xFFE5E5E5)),
    ),
    child: InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    course.discipline.toUpperCase(),
                    style: const TextStyle(
                      color: _muted,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 11,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: _lime,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    formatPrice(course.priceCents),
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              course.title,
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 8),
            Text(
              course.studio.name,
              style: const TextStyle(color: Color(0xFF525252)),
            ),
            const SizedBox(height: 5),
            Text(
              '${course.studio.city} · ${formatCourseDate(course.startAt)}',
              style: const TextStyle(color: _muted, fontSize: 13),
            ),
            const SizedBox(height: 5),
            Text(
              '${course.durationMinutes} min · ${course.availablePlaces == 0 ? 'Complet' : '${course.availablePlaces} ${course.availablePlaces == 1 ? 'place restante' : 'places restantes'}'}',
              style: const TextStyle(color: _muted, fontSize: 13),
            ),
          ],
        ),
      ),
    ),
  );
}

class CourseDetailsScreen extends StatefulWidget {
  const CourseDetailsScreen({
    super.key,
    required this.courseId,
    required this.auth,
  });

  final String courseId;
  final AuthController auth;

  @override
  State<CourseDetailsScreen> createState() => _CourseDetailsScreenState();
}

class _CourseDetailsScreenState extends State<CourseDetailsScreen> {
  Course? _course;
  bool _loading = true;
  bool _paying = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadCourse();
  }

  Future<void> _loadCourse() async {
    try {
      final response = await widget.auth.api.request(
        '/courses/${widget.courseId}',
      );
      if (mounted) {
        setState(
          () => _course = Course.fromJson(
            response['course'] as Map<String, dynamic>,
          ),
        );
      }
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _pay(Course course) async {
    if (widget.auth.user == null || widget.auth.token == null) {
      _push(context, LoginScreen(auth: widget.auth));
      return;
    }
    if (stripePublishableKey.isEmpty) {
      setState(
        () => _error =
            'Configure STRIPE_PUBLISHABLE_KEY pour activer le paiement.',
      );
      return;
    }

    setState(() {
      _paying = true;
      _error = null;
    });
    String? reservationId;
    var paymentCompleted = false;
    try {
      final preparation = await widget.auth.api.request(
        '/payments/prepare',
        method: 'POST',
        token: widget.auth.token,
        body: {'courseId': course.id},
      );
      reservationId = preparation['reservationId'] as String;
      if (preparation['alreadyPaid'] == true) {
        if (mounted) _push(context, ReservationsScreen(auth: widget.auth));
        return;
      }
      final clientSecret = preparation['clientSecret'] as String?;
      if (clientSecret == null || clientSecret.isEmpty) {
        throw const ApiException('Impossible d’initialiser le paiement.');
      }

      await Stripe.instance.initPaymentSheet(
        paymentSheetParameters: SetupPaymentSheetParameters(
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: 'CRÉNO',
          billingDetails: BillingDetails(
            name:
                '${widget.auth.user!.firstName} ${widget.auth.user!.lastName}',
            email: widget.auth.user!.email,
          ),
        ),
      );
      await Stripe.instance.presentPaymentSheet();
      paymentCompleted = true;
      await widget.auth.api.request(
        '/payments/confirm',
        method: 'POST',
        token: widget.auth.token,
        body: {'reservationId': reservationId},
      );
      if (!mounted) return;
      await showDialog<void>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Paiement réussi'),
          content: const Text('Ta réservation est confirmée.'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                _replace(context, ReservationsScreen(auth: widget.auth));
              },
              child: const Text('Voir mes réservations'),
            ),
          ],
        ),
      );
    } catch (error) {
      if (reservationId != null &&
          !paymentCompleted &&
          widget.auth.token != null) {
        try {
          await widget.auth.api.request(
            '/payments/cancel',
            method: 'POST',
            token: widget.auth.token,
            body: {'reservationId': reservationId},
          );
        } on ApiException catch (cancelError) {
          if (mounted) {
            setState(
              () => _error =
                  '${error is StripeException && error.error.code == FailureCode.Canceled ? 'Paiement annulé. ' : ''}${error.toString()} (La réservation en attente n’a pas pu être annulée : ${cancelError.message})',
            );
          }
          return;
        }
      }
      if (mounted) {
        setState(
          () => _error =
              error is StripeException &&
                  error.error.code == FailureCode.Canceled
              ? 'Paiement annulé. Ta place a été libérée.'
              : error.toString(),
        );
      }
    } finally {
      if (mounted) setState(() => _paying = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    final course = _course;
    if (course == null) {
      return Scaffold(
        appBar: AppBar(),
        body: _MessageState(
          title: 'Cours introuvable',
          message: _error ?? 'Impossible de charger ce cours.',
          action: _ActionButton(
            label: 'Retour',
            onPressed: () => Navigator.pop(context),
          ),
        ),
      );
    }
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(24, 18, 24, 32),
          children: [
            Align(
              alignment: Alignment.centerLeft,
              child: TextButton.icon(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.arrow_back),
                label: const Text('Retour'),
              ),
            ),
            const SizedBox(height: 18),
            Text(
              course.discipline.toUpperCase(),
              style: const TextStyle(
                color: _muted,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              course.title,
              style: const TextStyle(
                fontSize: 32,
                height: 1.15,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 18),
            Text(
              formatPrice(course.priceCents),
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: const Color(0xFFF5F5F5),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    course.studio.name,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '${course.studio.address}, ${course.studio.postalCode} ${course.studio.city}',
                    style: const TextStyle(color: _muted),
                  ),
                ],
              ),
            ),
            _DetailLine(label: 'Date', value: formatCourseDate(course.startAt)),
            _DetailLine(
              label: 'Durée',
              value: '${course.durationMinutes} minutes',
            ),
            _DetailLine(
              label: 'Places',
              value: course.availablePlaces == 0
                  ? 'Complet'
                  : '${course.availablePlaces} ${course.availablePlaces == 1 ? 'place disponible' : 'places disponibles'}',
            ),
            if (course.description?.isNotEmpty == true)
              _DetailLine(
                label: 'À propos du cours',
                value: course.description!,
              ),
            if (_error != null) _ErrorBox(_error!),
            const SizedBox(height: 20),
            _ActionButton(
              label: course.availablePlaces == 0
                  ? 'Complet'
                  : 'Payer ${formatPrice(course.priceCents)}',
              onPressed: () => _pay(course),
              loading: _paying,
              enabled: course.availablePlaces > 0,
            ),
            if (widget.auth.user == null && course.availablePlaces > 0)
              const Padding(
                padding: EdgeInsets.only(top: 12),
                child: Text(
                  'Tu devras te connecter pour payer.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: _muted, fontSize: 13),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _DetailLine extends StatelessWidget {
  const _DetailLine({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(top: 24),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.w700)),
        const SizedBox(height: 6),
        Text(
          value,
          style: const TextStyle(color: Color(0xFF525252), height: 1.4),
        ),
      ],
    ),
  );
}

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key, required this.auth});

  final AuthController auth;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_email.text.trim().isEmpty || _password.text.isEmpty) {
      setState(() => _error = 'Renseigne ton email et ton mot de passe.');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await widget.auth.signIn(_email.text.trim(), _password.text);
      if (mounted) _replace(context, HomeScreen(auth: widget.auth));
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    body: SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          _BackButton(onTap: () => Navigator.maybePop(context)),
          const SizedBox(height: 28),
          const Text(
            'Se connecter',
            style: TextStyle(fontSize: 32, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 8),
          const Text(
            'Retrouve tes prochains créneaux CRÉNO.',
            style: TextStyle(color: _muted, fontSize: 16),
          ),
          const SizedBox(height: 36),
          _Field(
            label: 'Email',
            controller: _email,
            hint: 'email@exemple.fr',
            keyboardType: TextInputType.emailAddress,
          ),
          _Field(label: 'Mot de passe', controller: _password, obscure: true),
          if (_error != null) _ErrorBox(_error!),
          const SizedBox(height: 22),
          _ActionButton(
            label: 'Se connecter',
            onPressed: _submit,
            loading: _loading,
          ),
          TextButton(
            onPressed: () => _push(context, RegisterScreen(auth: widget.auth)),
            child: const Text('Pas encore de compte ? Créer un compte'),
          ),
        ],
      ),
    ),
  );
}

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key, required this.auth});

  final AuthController auth;

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _firstName = TextEditingController();
  final _lastName = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _confirmation = TextEditingController();
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _firstName.dispose();
    _lastName.dispose();
    _email.dispose();
    _password.dispose();
    _confirmation.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if ([
      _firstName,
      _lastName,
      _email,
      _password,
    ].any((field) => field.text.trim().isEmpty)) {
      setState(() => _error = 'Tous les champs sont obligatoires.');
      return;
    }
    if (_password.text.length < 8) {
      setState(
        () => _error = 'Le mot de passe doit contenir au moins 8 caractères.',
      );
      return;
    }
    if (_password.text != _confirmation.text) {
      setState(() => _error = 'Les mots de passe ne correspondent pas.');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await widget.auth.signUp(
        firstName: _firstName.text.trim(),
        lastName: _lastName.text.trim(),
        email: _email.text.trim(),
        password: _password.text,
      );
      if (mounted) _replace(context, HomeScreen(auth: widget.auth));
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    body: SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          _BackButton(onTap: () => Navigator.maybePop(context)),
          const SizedBox(height: 24),
          const Text(
            'Créer un compte',
            style: TextStyle(fontSize: 32, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 8),
          const Text(
            'Réserve tes prochains cours à la dernière minute.',
            style: TextStyle(color: _muted, fontSize: 16),
          ),
          const SizedBox(height: 30),
          _Field(label: 'Prénom', controller: _firstName, hint: 'Julie'),
          _Field(label: 'Nom', controller: _lastName, hint: 'Martin'),
          _Field(
            label: 'Email',
            controller: _email,
            hint: 'julie@exemple.fr',
            keyboardType: TextInputType.emailAddress,
          ),
          _Field(label: 'Mot de passe', controller: _password, obscure: true),
          _Field(
            label: 'Confirmer le mot de passe',
            controller: _confirmation,
            obscure: true,
          ),
          if (_error != null) _ErrorBox(_error!),
          const SizedBox(height: 12),
          _ActionButton(
            label: 'Créer mon compte',
            onPressed: _submit,
            loading: _loading,
          ),
          TextButton(
            onPressed: () => _replace(context, LoginScreen(auth: widget.auth)),
            child: const Text('Déjà un compte ? Se connecter'),
          ),
        ],
      ),
    ),
  );
}

class _BackButton extends StatelessWidget {
  const _BackButton({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Align(
    alignment: Alignment.centerLeft,
    child: TextButton.icon(
      onPressed: onTap,
      icon: const Icon(Icons.arrow_back),
      label: const Text('Retour'),
      style: TextButton.styleFrom(foregroundColor: _ink),
    ),
  );
}

class AccountScreen extends StatelessWidget {
  const AccountScreen({super.key, required this.auth});

  final AuthController auth;

  @override
  Widget build(BuildContext context) => AnimatedBuilder(
    animation: auth,
    builder: (context, _) {
      final user = auth.user;
      if (user == null) {
        return Scaffold(
          body: SafeArea(
            child: _MessageState(
              title: 'Tu n’es pas connecté',
              message: 'Connecte-toi pour accéder à ton compte.',
              action: _ActionButton(
                label: 'Se connecter',
                onPressed: () => _replace(context, LoginScreen(auth: auth)),
              ),
            ),
          ),
        );
      }
      return Scaffold(
        body: SafeArea(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(24, 18, 24, 30),
            children: [
              _BackButton(onTap: () => Navigator.maybePop(context)),
              const SizedBox(height: 24),
              const Text(
                'Mon compte',
                style: TextStyle(fontSize: 32, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFFF5F5F5),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${user.firstName} ${user.lastName}',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(user.email, style: const TextStyle(color: _muted)),
                    const SizedBox(height: 8),
                    Text(
                      'Compte ${user.role == 'OWNER' ? 'propriétaire' : 'utilisateur'}',
                      style: const TextStyle(color: _muted),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              if (user.role == 'OWNER') ...[
                _ActionButton(
                  label: 'Espace studio',
                  onPressed: () =>
                      _push(context, StudioDashboardScreen(auth: auth)),
                ),
                const SizedBox(height: 12),
              ],
              _ActionButton(
                label: 'Mes réservations',
                onPressed: () => _push(context, ReservationsScreen(auth: auth)),
              ),
              const SizedBox(height: 12),
              _ActionButton(
                label: 'Se déconnecter',
                outlined: true,
                onPressed: () async {
                  await auth.signOut();
                  if (context.mounted) {
                    _replace(context, HomeScreen(auth: auth));
                  }
                },
              ),
            ],
          ),
        ),
      );
    },
  );
}

class ReservationsScreen extends StatefulWidget {
  const ReservationsScreen({super.key, required this.auth});

  final AuthController auth;

  @override
  State<ReservationsScreen> createState() => _ReservationsScreenState();
}

class _ReservationsScreenState extends State<ReservationsScreen> {
  List<Reservation> _reservations = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final token = widget.auth.token;
    if (token == null) {
      setState(() {
        _loading = false;
        _error = null;
      });
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final response = await widget.auth.api.request(
        '/reservations/mine',
        token: token,
      );
      final items = (response['reservations'] as List<dynamic>)
          .map((item) => Reservation.fromJson(item as Map<String, dynamic>))
          .toList();
      if (mounted) setState(() => _reservations = items);
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _statusLabel(String status) => switch (status) {
    'PENDING' => 'En attente de paiement',
    'PAID' => 'Payée',
    'CANCELLED' => 'Annulée',
    'REFUNDED' => 'Remboursée',
    _ => status,
  };

  @override
  Widget build(BuildContext context) {
    if (widget.auth.user == null || widget.auth.token == null) {
      return Scaffold(
        body: SafeArea(
          child: _MessageState(
            title: 'Connecte-toi pour voir tes réservations',
            message: '',
            action: _ActionButton(
              label: 'Se connecter',
              onPressed: () => _push(context, LoginScreen(auth: widget.auth)),
            ),
          ),
        ),
      );
    }
    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _load,
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(24, 18, 24, 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _BackButton(onTap: () => Navigator.maybePop(context)),
                      const SizedBox(height: 20),
                      const Text(
                        'Mes réservations',
                        style: TextStyle(
                          fontSize: 30,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              if (_loading)
                const SliverFillRemaining(
                  hasScrollBody: false,
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (_error != null)
                SliverFillRemaining(
                  hasScrollBody: false,
                  child: _MessageState(
                    title: 'Impossible de charger les réservations',
                    message: _error!,
                    action: _ActionButton(label: 'Réessayer', onPressed: _load),
                  ),
                )
              else if (_reservations.isEmpty)
                const SliverFillRemaining(
                  hasScrollBody: false,
                  child: _MessageState(
                    title: 'Aucune réservation',
                    message: 'Tes prochains cours apparaîtront ici.',
                  ),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(24, 0, 24, 28),
                  sliver: SliverList.builder(
                    itemCount: _reservations.length,
                    itemBuilder: (context, index) {
                      final reservation = _reservations[index];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 14),
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          border: Border.all(color: const Color(0xFFE5E5E5)),
                          borderRadius: BorderRadius.circular(18),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              reservation.course.discipline.toUpperCase(),
                              style: const TextStyle(
                                color: _muted,
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              reservation.course.title,
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(reservation.course.studio.name),
                            const SizedBox(height: 5),
                            Text(
                              formatCourseDate(reservation.course.startAt),
                              style: const TextStyle(color: _muted),
                            ),
                            const SizedBox(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  formatPrice(reservation.amountCents),
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                Flexible(
                                  child: Text(
                                    _statusLabel(reservation.status),
                                    textAlign: TextAlign.end,
                                    style: const TextStyle(
                                      color: Color(0xFF525252),
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class StudioDashboardScreen extends StatefulWidget {
  const StudioDashboardScreen({super.key, required this.auth});

  final AuthController auth;

  @override
  State<StudioDashboardScreen> createState() => _StudioDashboardScreenState();
}

class _StudioDashboardScreenState extends State<StudioDashboardScreen> {
  List<Studio> _studios = [];
  List<Course> _courses = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final token = widget.auth.token;
    if (token == null || widget.auth.user?.role != 'OWNER') {
      setState(() {
        _loading = false;
        _error = 'Accès réservé aux propriétaires.';
      });
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final results = await Future.wait([
        widget.auth.api.request('/studios/mine', token: token),
        widget.auth.api.request('/courses/mine', token: token),
      ]);
      final studios = (results[0]['studios'] as List<dynamic>)
          .map((item) => Studio.fromJson(item as Map<String, dynamic>))
          .toList();
      final courses = (results[1]['courses'] as List<dynamic>)
          .map((item) => Course.fromJson(item as Map<String, dynamic>))
          .toList();
      if (mounted) {
        setState(() {
          _studios = studios;
          _courses = courses;
        });
      }
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _courseStatus(String status) => switch (status) {
    'DRAFT' => 'Brouillon',
    'PUBLISHED' => 'Publié',
    'CANCELLED' => 'Annulé',
    _ => status,
  };

  @override
  Widget build(BuildContext context) {
    final user = widget.auth.user;
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (user == null || widget.auth.token == null || user.role != 'OWNER') {
      return Scaffold(
        body: SafeArea(
          child: _MessageState(
            title: user == null
                ? 'Connecte-toi pour accéder à ton espace studio'
                : 'Accès réservé aux propriétaires de studios',
            message: _error ?? '',
            action: _ActionButton(
              label: user == null ? 'Se connecter' : 'Retour à l’accueil',
              onPressed: () => user == null
                  ? _push(context, LoginScreen(auth: widget.auth))
                  : _replace(context, HomeScreen(auth: widget.auth)),
            ),
          ),
        ),
      );
    }

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _load,
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(24, 18, 24, 30),
            children: [
              _BackButton(onTap: () => Navigator.maybePop(context)),
              const SizedBox(height: 22),
              const Text(
                'Espace studio',
                style: TextStyle(fontSize: 32, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 8),
              Text(
                'Bonjour ${user.firstName}, gère ici tes studios et tes cours.',
                style: const TextStyle(color: _muted, fontSize: 16),
              ),
              if (_error != null) _ErrorBox(_error!),
              const SizedBox(height: 30),
              _SectionHeading(
                title: 'Mes studios',
                action: '+ Studio',
                onPressed: () async {
                  await _push(context, StudioFormScreen(auth: widget.auth));
                  if (mounted) _load();
                },
              ),
              if (_studios.isEmpty)
                const _EmptyPanel('Tu n’as pas encore de studio.')
              else
                ..._studios.map(
                  (studio) => _ManagementCard(
                    title: studio.name,
                    subtitle: '${studio.city} · ${studio.courseCount} cours',
                    onTap: () async {
                      await _push(
                        context,
                        StudioFormScreen(auth: widget.auth, studio: studio),
                      );
                      if (mounted) _load();
                    },
                  ),
                ),
              const SizedBox(height: 30),
              _SectionHeading(
                title: 'Mes cours',
                action: '+ Cours',
                onPressed: _studios.isEmpty
                    ? null
                    : () async {
                        await _push(
                          context,
                          CourseFormScreen(auth: widget.auth),
                        );
                        if (mounted) _load();
                      },
              ),
              if (_studios.isEmpty)
                const Padding(
                  padding: EdgeInsets.only(top: 10),
                  child: Text(
                    'Crée d’abord un studio pour pouvoir ajouter un cours.',
                    style: TextStyle(color: _muted, fontSize: 13),
                  ),
                )
              else if (_courses.isEmpty)
                const _EmptyPanel('Aucun cours créé.')
              else
                ..._courses.map(
                  (course) => _ManagementCard(
                    title: course.title,
                    subtitle:
                        '${course.discipline} · ${course.studio.name}\n${formatCourseDate(course.startAt)}',
                    trailing:
                        '${_courseStatus(course.status)}\n${formatPrice(course.priceCents)}',
                    onTap: () async {
                      await _push(
                        context,
                        CourseFormScreen(auth: widget.auth, course: course),
                      );
                      if (mounted) _load();
                    },
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SectionHeading extends StatelessWidget {
  const _SectionHeading({
    required this.title,
    required this.action,
    required this.onPressed,
  });

  final String title;
  final String action;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) => Row(
    mainAxisAlignment: MainAxisAlignment.spaceBetween,
    children: [
      Text(
        title,
        style: const TextStyle(fontSize: 23, fontWeight: FontWeight.w800),
      ),
      TextButton(
        onPressed: onPressed,
        style: TextButton.styleFrom(
          foregroundColor: _ink,
          backgroundColor: onPressed == null ? const Color(0xFFE5E5E5) : _lime,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        ),
        child: Text(
          action,
          style: const TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
    ],
  );
}

class _ManagementCard extends StatelessWidget {
  const _ManagementCard({
    required this.title,
    required this.subtitle,
    required this.onTap,
    this.trailing,
  });

  final String title;
  final String subtitle;
  final String? trailing;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Card(
    margin: const EdgeInsets.only(top: 12),
    elevation: 0,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(16),
      side: const BorderSide(color: Color(0xFFE5E5E5)),
    ),
    child: ListTile(
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 9),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
      subtitle: Padding(
        padding: const EdgeInsets.only(top: 5),
        child: Text(subtitle, style: const TextStyle(height: 1.4)),
      ),
      trailing: trailing == null
          ? const Icon(Icons.chevron_right)
          : Text(
              trailing!,
              textAlign: TextAlign.end,
              style: const TextStyle(color: Color(0xFF525252), fontSize: 12),
            ),
    ),
  );
}

class _EmptyPanel extends StatelessWidget {
  const _EmptyPanel(this.message);

  final String message;

  @override
  Widget build(BuildContext context) => Container(
    margin: const EdgeInsets.only(top: 14),
    padding: const EdgeInsets.all(18),
    decoration: BoxDecoration(
      color: const Color(0xFFF5F5F5),
      borderRadius: BorderRadius.circular(16),
    ),
    child: Text(
      message,
      textAlign: TextAlign.center,
      style: const TextStyle(color: Color(0xFF525252)),
    ),
  );
}

class StudioFormScreen extends StatefulWidget {
  const StudioFormScreen({super.key, required this.auth, this.studio});

  final AuthController auth;
  final Studio? studio;

  @override
  State<StudioFormScreen> createState() => _StudioFormScreenState();
}

class _StudioFormScreenState extends State<StudioFormScreen> {
  late final TextEditingController _name;
  late final TextEditingController _description;
  late final TextEditingController _address;
  late final TextEditingController _postalCode;
  late final TextEditingController _city;
  late final TextEditingController _phone;
  bool _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    final studio = widget.studio;
    _name = TextEditingController(text: studio?.name ?? '');
    _description = TextEditingController(text: studio?.description ?? '');
    _address = TextEditingController(text: studio?.address ?? '');
    _postalCode = TextEditingController(text: studio?.postalCode ?? '');
    _city = TextEditingController(text: studio?.city ?? '');
    _phone = TextEditingController(text: studio?.phone ?? '');
  }

  @override
  void dispose() {
    _name.dispose();
    _description.dispose();
    _address.dispose();
    _postalCode.dispose();
    _city.dispose();
    _phone.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (widget.auth.user?.role != 'OWNER' || widget.auth.token == null) {
      setState(() => _error = 'Accès réservé aux propriétaires.');
      return;
    }
    if ([
      _name,
      _address,
      _postalCode,
      _city,
    ].any((field) => field.text.trim().isEmpty)) {
      setState(
        () => _error = 'Nom, adresse, code postal et ville sont obligatoires.',
      );
      return;
    }
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final body = <String, Object?>{
        'name': _name.text.trim(),
        'description': _description.text.trim(),
        'address': _address.text.trim(),
        'postalCode': _postalCode.text.trim(),
        'city': _city.text.trim(),
        'phone': _phone.text.trim(),
      };
      final studio = widget.studio;
      await widget.auth.api.request(
        studio == null ? '/studios' : '/studios/${studio.id}',
        method: studio == null ? 'POST' : 'PATCH',
        token: widget.auth.token,
        body: body,
      );
      if (mounted) Navigator.pop(context);
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    body: SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(24, 18, 24, 30),
        children: [
          _BackButton(onTap: () => Navigator.maybePop(context)),
          const SizedBox(height: 22),
          Text(
            widget.studio == null ? 'Nouveau studio' : 'Modifier le studio',
            style: const TextStyle(fontSize: 30, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 28),
          _Field(
            label: 'Nom *',
            controller: _name,
            hint: 'Reformer Club Paris',
          ),
          _Field(
            label: 'Description',
            controller: _description,
            multiline: true,
          ),
          _Field(
            label: 'Adresse *',
            controller: _address,
            hint: '12 rue Oberkampf',
          ),
          _Field(
            label: 'Code postal *',
            controller: _postalCode,
            keyboardType: TextInputType.number,
          ),
          _Field(label: 'Ville *', controller: _city, hint: 'Paris'),
          _Field(
            label: 'Téléphone',
            controller: _phone,
            keyboardType: TextInputType.phone,
          ),
          if (_error != null) _ErrorBox(_error!),
          const SizedBox(height: 10),
          _ActionButton(
            label: widget.studio == null ? 'Créer le studio' : 'Enregistrer',
            onPressed: _save,
            loading: _saving,
          ),
        ],
      ),
    ),
  );
}

class CourseFormScreen extends StatefulWidget {
  const CourseFormScreen({super.key, required this.auth, this.course});

  final AuthController auth;
  final Course? course;

  @override
  State<CourseFormScreen> createState() => _CourseFormScreenState();
}

class _CourseFormScreenState extends State<CourseFormScreen> {
  final _title = TextEditingController();
  final _discipline = TextEditingController();
  final _description = TextEditingController();
  final _date = TextEditingController();
  final _time = TextEditingController();
  final _duration = TextEditingController(text: '60');
  final _price = TextEditingController();
  final _capacity = TextEditingController(text: '10');
  List<Studio> _studios = [];
  String? _studioId;
  String _status = 'DRAFT';
  bool _loading = true;
  bool _saving = false;
  String? _error;

  bool get _editing => widget.course != null;

  @override
  void initState() {
    super.initState();
    final course = widget.course;
    if (course != null) {
      _title.text = course.title;
      _discipline.text = course.discipline;
      _description.text = course.description ?? '';
      final start = course.startAt.toLocal();
      _date.text =
          '${start.year.toString().padLeft(4, '0')}-${start.month.toString().padLeft(2, '0')}-${start.day.toString().padLeft(2, '0')}';
      _time.text =
          '${start.hour.toString().padLeft(2, '0')}:${start.minute.toString().padLeft(2, '0')}';
      _duration.text = course.durationMinutes.toString();
      _price.text = (course.priceCents / 100).toStringAsFixed(2);
      _capacity.text = course.capacity.toString();
      _studioId = course.studioId;
      _status = course.status;
      _loading = false;
    } else {
      _loadStudios();
    }
  }

  @override
  void dispose() {
    _title.dispose();
    _discipline.dispose();
    _description.dispose();
    _date.dispose();
    _time.dispose();
    _duration.dispose();
    _price.dispose();
    _capacity.dispose();
    super.dispose();
  }

  Future<void> _loadStudios() async {
    if (widget.auth.user?.role != 'OWNER' || widget.auth.token == null) {
      setState(() {
        _error = 'Accès réservé aux propriétaires.';
        _loading = false;
      });
      return;
    }
    try {
      final response = await widget.auth.api.request(
        '/studios/mine',
        token: widget.auth.token,
      );
      final studios = (response['studios'] as List<dynamic>)
          .map((item) => Studio.fromJson(item as Map<String, dynamic>))
          .toList();
      if (mounted) {
        setState(() {
          _studios = studios;
          _studioId = studios.isEmpty ? null : studios.first.id;
        });
      }
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _save() async {
    final token = widget.auth.token;
    final course = widget.course;
    if (token == null || widget.auth.user?.role != 'OWNER') {
      setState(() => _error = 'Accès réservé aux propriétaires.');
      return;
    }
    if (!_editing && _studioId == null) {
      setState(() => _error = 'Choisis un studio.');
      return;
    }
    if (_title.text.trim().isEmpty || _discipline.text.trim().isEmpty) {
      setState(() => _error = 'Titre et discipline sont obligatoires.');
      return;
    }
    final datePattern = RegExp(r'^\d{4}-\d{2}-\d{2}$');
    final timePattern = RegExp(r'^\d{2}:\d{2}$');
    final startAt =
        datePattern.hasMatch(_date.text.trim()) &&
            timePattern.hasMatch(_time.text.trim())
        ? DateTime.tryParse('${_date.text.trim()}T${_time.text.trim()}:00')
        : null;
    if (startAt == null) {
      setState(
        () => _error = 'Utilise une date AAAA-MM-JJ et une heure HH:MM.',
      );
      return;
    }
    if (!startAt.isAfter(DateTime.now())) {
      setState(() => _error = 'Le cours doit être prévu dans le futur.');
      return;
    }
    final euros = double.tryParse(_price.text.trim().replaceAll(',', '.'));
    final duration = int.tryParse(_duration.text.trim());
    final capacity = int.tryParse(_capacity.text.trim());
    if (euros == null || !euros.isFinite || euros < 0) {
      setState(() => _error = 'Prix invalide.');
      return;
    }
    if (duration == null || duration < 15) {
      setState(() => _error = 'La durée doit être au moins de 15 minutes.');
      return;
    }
    if (capacity == null || capacity < 1) {
      setState(() => _error = 'La capacité doit être au moins de 1.');
      return;
    }

    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final body = <String, Object?>{
        if (!_editing) 'studioId': _studioId,
        'title': _title.text.trim(),
        'discipline': _discipline.text.trim(),
        'description': _description.text.trim(),
        'startAt': startAt.toUtc().toIso8601String(),
        'durationMinutes': duration,
        'priceCents': (euros * 100).round(),
        'capacity': capacity,
      };
      await widget.auth.api.request(
        _editing ? '/courses/${course!.id}' : '/courses',
        method: _editing ? 'PATCH' : 'POST',
        token: token,
        body: body,
      );
      if (mounted) Navigator.pop(context);
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _changeStatus(String status) async {
    final course = widget.course;
    final token = widget.auth.token;
    if (course == null || token == null) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      await widget.auth.api.request(
        '/courses/${course.id}',
        method: 'PATCH',
        token: token,
        body: {'status': status},
      );
      if (mounted) setState(() => _status = status);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              status == 'PUBLISHED' ? 'Cours publié.' : 'Cours annulé.',
            ),
          ),
        );
      }
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(24, 18, 24, 30),
          children: [
            _BackButton(onTap: () => Navigator.maybePop(context)),
            const SizedBox(height: 22),
            Text(
              _editing ? 'Gérer le cours' : 'Nouveau cours',
              style: const TextStyle(fontSize: 30, fontWeight: FontWeight.w800),
            ),
            if (_editing)
              Padding(
                padding: const EdgeInsets.only(top: 12),
                child: Chip(
                  label: Text(switch (_status) {
                    'PUBLISHED' => 'Publié',
                    'CANCELLED' => 'Annulé',
                    _ => 'Brouillon',
                  }),
                ),
              )
            else ...[
              const SizedBox(height: 8),
              const Text(
                'Le cours sera d’abord créé en brouillon.',
                style: TextStyle(color: _muted),
              ),
              const SizedBox(height: 22),
              const Text(
                'Studio',
                style: TextStyle(fontWeight: FontWeight.w700),
              ),
              RadioGroup<String>(
                groupValue: _studioId,
                onChanged: (id) => setState(() => _studioId = id),
                child: Column(
                  children: _studios
                      .map(
                        (studio) => RadioListTile<String>(
                          contentPadding: EdgeInsets.zero,
                          title: Text(studio.name),
                          subtitle: Text(studio.city),
                          value: studio.id,
                        ),
                      )
                      .toList(),
                ),
              ),
            ],
            const SizedBox(height: 12),
            _Field(
              label: 'Titre',
              controller: _title,
              hint: 'Pilates Reformer débutant',
            ),
            _Field(
              label: 'Discipline',
              controller: _discipline,
              hint: 'Pilates',
            ),
            _Field(
              label: 'Description',
              controller: _description,
              multiline: true,
            ),
            _Field(
              label: 'Date (AAAA-MM-JJ)',
              controller: _date,
              hint: '2026-10-20',
              keyboardType: TextInputType.datetime,
            ),
            _Field(
              label: 'Heure (HH:MM)',
              controller: _time,
              hint: '18:30',
              keyboardType: TextInputType.datetime,
            ),
            _Field(
              label: 'Durée en minutes',
              controller: _duration,
              keyboardType: TextInputType.number,
            ),
            _Field(
              label: 'Prix en euros',
              controller: _price,
              hint: '19,00',
              keyboardType: const TextInputType.numberWithOptions(
                decimal: true,
              ),
            ),
            _Field(
              label: 'Capacité',
              controller: _capacity,
              keyboardType: TextInputType.number,
            ),
            if (_error != null) _ErrorBox(_error!),
            const SizedBox(height: 8),
            _ActionButton(
              label: _editing
                  ? 'Enregistrer les modifications'
                  : 'Créer le brouillon',
              onPressed: _save,
              loading: _saving,
            ),
            if (_editing && _status != 'PUBLISHED') ...[
              const SizedBox(height: 12),
              _ActionButton(
                label: 'Publier le cours',
                onPressed: () => _changeStatus('PUBLISHED'),
                outlined: true,
                loading: _saving,
              ),
            ],
            if (_editing && _status != 'CANCELLED') ...[
              const SizedBox(height: 12),
              _ActionButton(
                label: 'Annuler le cours',
                onPressed: () => _changeStatus('CANCELLED'),
                outlined: true,
                loading: _saving,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
