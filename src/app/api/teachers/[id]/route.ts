import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      teacherId,
      name,
      qualification,
      contactNumber,
      email,
      address,
      employmentStatus,
    } = body;

    if (!teacherId || !name) {
      return NextResponse.json(
        { error: "Teacher ID and name are required." },
        { status: 400 }
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
        employmentStatus: employmentStatus || "ACTIVE",
      },
    });

    return NextResponse.json({ teacher });
  } catch (error) {
    console.error("PUT teacher error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update teacher.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    const teacher = await prisma.teacher.findUnique({
      where: {
        id,
      },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found." },
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
            : "Unable to delete teacher.",
      },
      { status: 500 }
    );
  }
}
