import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const feeType = await prisma.feeType.findUnique({
      where: { id },
    });

    if (!feeType) {
      return NextResponse.json(
        { error: "Fee type not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(feeType);
  } catch (error) {
    console.error("GET fee type error:", error);

    return NextResponse.json(
      { error: "Unable to load fee type." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const name = String(body.name || "").trim();
    const description = body.description
      ? String(body.description).trim()
      : null;

    if (!name) {
      return NextResponse.json(
        { error: "Fee type name is required." },
        { status: 400 }
      );
    }

    const existing = await prisma.feeType.findFirst({
      where: {
        name,
        NOT: {
          id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Another fee type with this name already exists." },
        { status: 409 }
      );
    }

    const feeType = await prisma.feeType.update({
      where: { id },
      data: {
        name,
        description,
        isActive:
          typeof body.isActive === "boolean"
            ? body.isActive
            : true,
      },
    });

    return NextResponse.json(feeType);
  } catch (error) {
    console.error("PUT fee type error:", error);

    return NextResponse.json(
      { error: "Unable to update fee type." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const feeType = await prisma.feeType.findUnique({
      where: { id },
    });

    if (!feeType) {
      return NextResponse.json(
        { error: "Fee type not found." },
        { status: 404 }
      );
    }

    const usedCount = await prisma.feeStructure.count({
      where: {
        feeTypeId: id,
      },
    });

    if (usedCount > 0) {
      return NextResponse.json(
        {
          error:
            "This fee type is already used in a fee structure. Deactivate it instead of deleting it.",
        },
        { status: 409 }
      );
    }

    await prisma.feeType.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Fee type deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE fee type error:", error);

    return NextResponse.json(
      { error: "Unable to delete fee type." },
      { status: 500 }
    );
  }
}