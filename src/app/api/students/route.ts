import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Gender, StudentStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

// GET - students list
export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("GET students error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch students.",
      },
      { status: 500 }
    );
  }
}

// POST - add student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      studentId,
      admissionNumber,
      fullName,
      fatherName,
      motherName,
      guardianName,
      dateOfBirth,
      gender,
      rollNumber,
      contactNumber,
      parentContact,
      address,
      emergencyContact,
      previousSchool,
    } = body;

    if (!studentId || !admissionNumber || !fullName) {
      return NextResponse.json(
        {
          error:
            "Student ID, Admission Number and Full Name are required.",
        },
        { status: 400 }
      );
    }

    const existingStudent = await prisma.student.findFirst({
      where: {
        OR: [{ studentId }, { admissionNumber }],
      },
    });

    if (existingStudent) {
      return NextResponse.json(
        {
          error:
            "Student ID or Admission Number already exists.",
        },
        { status: 409 }
      );
    }

    const student = await prisma.student.create({
      data: {
        studentId,
        admissionNumber,
        fullName,
        fatherName: fatherName || null,
        motherName: motherName || null,
        guardianName: guardianName || null,

        dateOfBirth: dateOfBirth
          ? new Date(dateOfBirth)
          : null,

        gender:
          gender &&
          Object.values(Gender).includes(gender as Gender)
            ? (gender as Gender)
            : null,

        rollNumber: rollNumber || null,
        contactNumber: contactNumber || null,
        parentContact: parentContact || null,
        address: address || null,
        emergencyContact: emergencyContact || null,
        previousSchool: previousSchool || null,

        status: StudentStatus.ACTIVE,
      },
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("POST student error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to add student.",
      },
      { status: 500 }
    );
  }
}

// PUT - edit student
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      id,
      studentId,
      admissionNumber,
      fullName,
      fatherName,
      motherName,
      guardianName,
      dateOfBirth,
      gender,
      rollNumber,
      contactNumber,
      parentContact,
      address,
      emergencyContact,
      previousSchool,
      status,
    } = body;

    if (!id || !studentId || !admissionNumber || !fullName) {
      return NextResponse.json(
        {
          error:
            "Required student information is missing.",
        },
        { status: 400 }
      );
    }

    const existingStudent = await prisma.student.findFirst({
      where: {
        OR: [{ studentId }, { admissionNumber }],
        NOT: {
          id,
        },
      },
    });

    if (existingStudent) {
      return NextResponse.json(
        {
          error:
            "Student ID or Admission Number already exists.",
        },
        { status: 409 }
      );
    }

    const student = await prisma.student.update({
      where: {
        id,
      },
      data: {
        studentId,
        admissionNumber,
        fullName,
        fatherName: fatherName || null,
        motherName: motherName || null,
        guardianName: guardianName || null,

        dateOfBirth: dateOfBirth
          ? new Date(dateOfBirth)
          : null,

        gender:
          gender &&
          Object.values(Gender).includes(gender as Gender)
            ? (gender as Gender)
            : null,

        rollNumber: rollNumber || null,
        contactNumber: contactNumber || null,
        parentContact: parentContact || null,
        address: address || null,
        emergencyContact: emergencyContact || null,
        previousSchool: previousSchool || null,

        status:
          status &&
          Object.values(StudentStatus).includes(
            status as StudentStatus
          )
            ? (status as StudentStatus)
            : StudentStatus.ACTIVE,
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("PUT student error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update student.",
      },
      { status: 500 }
    );
  }
}

// DELETE - delete student
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          error: "Student ID is required.",
        },
        { status: 400 }
      );
    }

    await prisma.student.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Student deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE student error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete student.",
      },
      { status: 500 }
    );
  }
}