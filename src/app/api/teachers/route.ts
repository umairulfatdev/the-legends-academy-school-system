import { NextRequest, NextResponse } from "next/server";
import {
  PrismaClient,
  EmploymentStatus,
  UserRole,
} from "@prisma/client";
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

// GET - teachers list
export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      teachers,
    });
  } catch (error) {
    console.error("GET teachers error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch teachers.",
      },
      { status: 500 }
    );
  }
}

// POST - add teacher
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      teacherId,
      name,
      qualification,
      contactNumber,
      email,
      address,
      joiningDate,
      employmentStatus,
    } = body;

    if (!teacherId || !name) {
      return NextResponse.json(
        {
          error: "Teacher ID and Teacher Name are required.",
        },
        { status: 400 }
      );
    }

    // Check duplicate Teacher ID
    const existingTeacher = await prisma.teacher.findUnique({
      where: {
        teacherId,
      },
    });

    if (existingTeacher) {
      return NextResponse.json(
        {
          error: "Teacher ID already exists.",
        },
        { status: 409 }
      );
    }

    /*
      Teacher model mein userId required hai.
      Isliye Teacher create karne se pehle User create karna hoga.
    */

    const teacherEmail =
      email ||
      `${teacherId
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")}@teacher.local`;

    // Check duplicate email
    const existingUser = await prisma.user.findUnique({
      where: {
        email: teacherEmail,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "This email is already in use.",
        },
        { status: 409 }
      );
    }

    const teacher = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: teacherEmail,
          passwordHash: "TEMP_PASSWORD",
          role: UserRole.TEACHER,
        },
      });

      return await tx.teacher.create({
        data: {
          userId: user.id,
          teacherId,
          name,
          qualification: qualification || null,
          contactNumber: contactNumber || null,
          email: email || null,
          address: address || null,
          joiningDate: joiningDate
            ? new Date(joiningDate)
            : null,
          employmentStatus:
            employmentStatus &&
            Object.values(EmploymentStatus).includes(
              employmentStatus as EmploymentStatus
            )
              ? (employmentStatus as EmploymentStatus)
              : EmploymentStatus.ACTIVE,
        },
      });
    });

    return NextResponse.json(
      { teacher },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST teacher error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to add teacher.",
      },
      { status: 500 }
    );
  }
}

// PUT - edit teacher
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      id,
      teacherId,
      name,
      qualification,
      contactNumber,
      email,
      address,
      joiningDate,
      employmentStatus,
    } = body;

    if (!id || !teacherId || !name) {
      return NextResponse.json(
        {
          error:
            "Teacher ID, Teacher Name and ID are required.",
        },
        { status: 400 }
      );
    }

    const existingTeacher =
      await prisma.teacher.findFirst({
        where: {
          OR: [
            {
              teacherId,
            },
            ...(email
              ? [{ email }]
              : []),
          ],
          NOT: {
            id,
          },
        },
      });

    if (existingTeacher) {
      return NextResponse.json(
        {
          error:
            "Teacher ID or email already exists.",
        },
        { status: 409 }
      );
    }

    const teacher = await prisma.teacher.update({
      where: {
        id,
      },
      data: {
        teacherId,
        name,
        qualification: qualification || null,
        contactNumber: contactNumber || null,
        email: email || null,
        address: address || null,
        joiningDate: joiningDate
          ? new Date(joiningDate)
          : null,
        employmentStatus:
          employmentStatus &&
          Object.values(EmploymentStatus).includes(
            employmentStatus as EmploymentStatus
          )
            ? (employmentStatus as EmploymentStatus)
            : EmploymentStatus.ACTIVE,
      },
    });

    return NextResponse.json({
      teacher,
    });
  } catch (error) {
    console.error("PUT teacher error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update teacher.",
      },
      { status: 500 }
    );
  }
}

// DELETE - delete teacher
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          error: "Teacher ID is required.",
        },
        { status: 400 }
      );
    }

    const teacher = await prisma.teacher.findUnique({
      where: {
        id,
      },
    });

    if (!teacher) {
      return NextResponse.json(
        {
          error: "Teacher not found.",
        },
        { status: 404 }
      );
    }

    await prisma.teacher.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Teacher deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE teacher error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete teacher.",
      },
      { status: 500 }
    );
  }
}