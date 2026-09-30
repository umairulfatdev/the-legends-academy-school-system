import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.student.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Student deleted successfully.",
    });
  } catch (error) {
    console.error("Delete student error:", error);

    return NextResponse.json(
      {
        error: "Failed to delete student.",
      },
      { status: 500 }
    );
  }
}