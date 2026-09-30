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

    const name = String(body.name || "").trim();
    const code = String(body.code || "").trim();
    const totalMarks = Number(body.totalMarks || 100);
    const passingMarks = Number(body.passingMarks || 40);

    if (!name) {
      return NextResponse.json(
        {
          error: "Subject name is required.",
        },
        {
          status: 400,
        }
      );
    }

    const subject = await prisma.subject.update({
      where: {
        id,
      },
      data: {
        name,
        code: code || null,
        totalMarks,
        passingMarks,
      },
    });

    return NextResponse.json({
      subject,
    });
  } catch (error: any) {
    console.error("PUT SUBJECT ERROR:", error);

    if (error?.code === "P2025") {
      return NextResponse.json(
        {
          error: "Subject not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          error: "Subject code already exists.",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        error: "Unable to update subject.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    await prisma.subject.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Subject deleted successfully.",
    });
  } catch (error: any) {
    console.error("DELETE SUBJECT ERROR:", error);

    if (error?.code === "P2025") {
      return NextResponse.json(
        {
          error: "Subject not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        error: "Unable to delete subject.",
      },
      {
        status: 500,
      }
    );
  }
}