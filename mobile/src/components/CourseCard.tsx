import { router } from "expo-router";
import {
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import type { PublicCourse } from "../types/course";
import {
    formatCourseDate,
    formatPrice,
} from "../utils/format";

type CourseCardProps = {
    course: PublicCourse;
};

export function CourseCard({
    course,
}: CourseCardProps) {
    return (
        <TouchableOpacity
            className="mb-4 rounded-2xl border border-neutral-200 bg-white p-5"
            activeOpacity={0.8}
            onPress={() =>
                router.push({
                    pathname: "/course/[id]",
                    params: {
                        id: course.id,
                    },
                })
            }
        >
            <View className="mb-3 flex-row items-center justify-between">
                <Text
                    style={{
                        color: "#737373",
                        fontSize: 13,
                        fontWeight: "600",
                        textTransform: "uppercase",
                    }}
                >
                    {course.discipline}
                </Text>

                <View className="rounded-full bg-creno-lime px-3 py-1">
                    <Text
                        style={{
                            color: "#111111",
                            fontSize: 13,
                            fontWeight: "700",
                        }}
                    >
                        {formatPrice(course.priceCents)}
                    </Text>
                </View>
            </View>

            <Text
                style={{
                    color: "#111111",
                    fontSize: 20,
                    fontWeight: "700",
                }}
            >
                {course.title}
            </Text>

            <Text
                style={{
                    color: "#525252",
                    fontSize: 15,
                    marginTop: 8,
                }}
            >
                {course.studio.name}
            </Text>

            <Text
                style={{
                    color: "#737373",
                    fontSize: 14,
                    marginTop: 5,
                }}
            >
                {course.studio.city} ·{" "}
                {formatCourseDate(course.startAt)}
            </Text>

            <Text
                style={{
                    color: "#737373",
                    fontSize: 14,
                    marginTop: 5,
                }}
            >
                {course.durationMinutes} min ·{" "}
                {course.availablePlaces === 0
                    ? "Complet"
                    : `${course.availablePlaces} ${course.availablePlaces > 1
                        ? "places restantes"
                        : "place restante"
                    }`}
            </Text>
        </TouchableOpacity>
    );
}