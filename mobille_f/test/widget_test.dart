import 'package:flutter_test/flutter_test.dart';

import 'package:mobille_f/models.dart';
import 'package:mobille_f/screens.dart';

void main() {
  test('formats prices using French conventions', () {
    expect(formatPrice(1900), '19,00 €');
    expect(formatPrice(950), '9,50 €');
  });

  test('formats course dates in French', () {
    expect(
      formatCourseDate(DateTime(2026, 11, 5, 18, 30)),
      'jeu. 5 nov. à 18:30',
    );
  });

  test('parses a course returned by the API', () {
    final course = Course.fromJson({
      'id': 'course-1',
      'studioId': 'studio-1',
      'title': 'Pilates débutant',
      'discipline': 'Pilates',
      'description': null,
      'startAt': '2026-11-05T17:30:00.000Z',
      'durationMinutes': 60,
      'priceCents': 1900,
      'capacity': 10,
      'availablePlaces': 3,
      'status': 'PUBLISHED',
      'studio': {'id': 'studio-1', 'name': 'Studio CRÉNO', 'city': 'Paris'},
    });

    expect(course.title, 'Pilates débutant');
    expect(course.studio.name, 'Studio CRÉNO');
    expect(course.availablePlaces, 3);
  });
}
