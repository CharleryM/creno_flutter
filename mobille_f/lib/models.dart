class AppUser {
  const AppUser({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.role,
  });

  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String role;

  factory AppUser.fromJson(Map<String, dynamic> json) => AppUser(
    id: json['id'] as String,
    firstName: json['firstName'] as String,
    lastName: json['lastName'] as String,
    email: json['email'] as String,
    role: json['role'] as String,
  );
}

class Studio {
  const Studio({
    required this.id,
    required this.name,
    required this.city,
    this.address = '',
    this.postalCode = '',
    this.description,
    this.phone,
    this.courseCount = 0,
  });

  final String id;
  final String name;
  final String city;
  final String address;
  final String postalCode;
  final String? description;
  final String? phone;
  final int courseCount;

  factory Studio.fromJson(Map<String, dynamic> json) => Studio(
    id: json['id'] as String,
    name: json['name'] as String,
    city: json['city'] as String,
    address: json['address'] as String? ?? '',
    postalCode: json['postalCode'] as String? ?? '',
    description: json['description'] as String?,
    phone: json['phone'] as String?,
    courseCount:
        (json['_count'] as Map<String, dynamic>?)?['courses'] as int? ?? 0,
  );
}

class Course {
  const Course({
    required this.id,
    required this.studioId,
    required this.title,
    required this.discipline,
    required this.startAt,
    required this.durationMinutes,
    required this.priceCents,
    required this.capacity,
    required this.availablePlaces,
    required this.status,
    required this.studio,
    this.description,
  });

  final String id;
  final String studioId;
  final String title;
  final String discipline;
  final DateTime startAt;
  final int durationMinutes;
  final int priceCents;
  final int capacity;
  final int availablePlaces;
  final String status;
  final Studio studio;
  final String? description;

  factory Course.fromJson(Map<String, dynamic> json) => Course(
    id: json['id'] as String,
    studioId: json['studioId'] as String,
    title: json['title'] as String,
    discipline: json['discipline'] as String,
    startAt: DateTime.parse(json['startAt'] as String),
    durationMinutes: json['durationMinutes'] as int,
    priceCents: json['priceCents'] as int,
    capacity: json['capacity'] as int? ?? 0,
    availablePlaces: json['availablePlaces'] as int? ?? 0,
    status: json['status'] as String? ?? 'DRAFT',
    studio: Studio.fromJson(json['studio'] as Map<String, dynamic>),
    description: json['description'] as String?,
  );
}

class Reservation {
  const Reservation({
    required this.id,
    required this.status,
    required this.amountCents,
    required this.course,
  });

  final String id;
  final String status;
  final int amountCents;
  final Course course;

  factory Reservation.fromJson(Map<String, dynamic> json) {
    final courseJson = json['course'] as Map<String, dynamic>;
    return Reservation(
      id: json['id'] as String,
      status: json['status'] as String,
      amountCents: json['amountCents'] as int,
      course: Course.fromJson({
        ...courseJson,
        'studioId': courseJson['studioId'] ?? '',
        'capacity': courseJson['capacity'] ?? 0,
        'availablePlaces': courseJson['availablePlaces'] ?? 0,
        'status': courseJson['status'] ?? 'PUBLISHED',
      }),
    );
  }
}
