import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  request: NextRequest,
  context: Context
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Exam ID is required." },
        { status: 400 }
      );
    }

    const exam = await prisma.test.findUnique({
      where: {
        id,
      },
    });

    if (!exam) {
      return NextResponse.json(
        { error: "Exam not found." },
        { status: 404 }
      );
    }

    await prisma.test.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Exam deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE exam error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete exam.",
      },
      { status: 500 }
    );
  }
}