import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      subjects,
    });
  } catch (error) {
    console.error("GET SUBJECTS ERROR:", error);

    return NextResponse.json(
      {
        error: "Unable to load subjects.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    const subject = await prisma.subject.create({
      data: {
        name,
        code: code || null,
        totalMarks,
        passingMarks,
      },
    });

    return NextResponse.json(
      {
        subject,
      },
      {
        status: 201,
      }
    );
  } catch (error: any) {
    console.error("POST SUBJECT ERROR:", error);

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
        error: "Unable to create subject.",
      },
      {
        status: 500,
      }
    );
  }
}