import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const studentId = searchParams.get("studentId");
    const status = searchParams.get("status");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: any = {};

    if (studentId) {
      where.studentId = studentId;
    }

    if (status) {
      where.status = status;
    }

    if (from || to) {
      where.feeMonth = {};

      if (from) {
        where.feeMonth.gte = new Date(from);
      }

      if (to) {
        const endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);
        where.feeMonth.lte = endDate;
      }
    }

    const vouchers = await prisma.feeVoucher.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            fullName: true,
            admissionNumber: true,
          },
        },
        session: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          include: {
            feeType: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            receiptNumber: true,
            amount: true,
            method: true,
            status: true,
            transactionRef: true,
            paidAt: true,
          },
          orderBy: {
            paidAt: "desc",
          },
        },
      },
      orderBy: {
        feeMonth: "desc",
      },
    });

    const report = vouchers.map((voucher) => ({
      id: voucher.id,
      voucherNumber: voucher.voucherNumber,
      student: voucher.student,
      session: voucher.session,
      feeMonth: voucher.feeMonth,
      dueDate: voucher.dueDate,
      subtotal: Number(voucher.subtotal),
      discount: Number(voucher.discount),
      lateFee: Number(voucher.lateFee),
      totalAmount: Number(voucher.totalAmount),
      paidAmount: Number(voucher.paidAmount),
      remainingAmount: Number(voucher.remainingAmount),
      status: voucher.status,
      items: voucher.items.map((item) => ({
        id: item.id,
        description: item.description,
        amount: Number(item.amount),
        feeType: item.feeType,
      })),
      payments: voucher.payments.map((payment) => ({
        ...payment,
        amount: Number(payment.amount),
      })),
    }));

    const summary = report.reduce(
      (totals, voucher) => {
        totals.totalBilled += voucher.totalAmount;
        totals.totalCollected += voucher.paidAmount;
        totals.totalRemaining += voucher.remainingAmount;

        if (voucher.status === "PAID") {
          totals.paidCount += 1;
        } else if (voucher.status === "PARTIAL") {
          totals.partialCount += 1;
        } else if (voucher.status === "UNPAID") {
          totals.unpaidCount += 1;
        } else if (voucher.status === "OVERDUE") {
          totals.overdueCount += 1;
        }

        return totals;
      },
      {
        totalBilled: 0,
        totalCollected: 0,
        totalRemaining: 0,
        paidCount: 0,
        partialCount: 0,
        unpaidCount: 0,
        overdueCount: 0,
      }
    );

    return NextResponse.json({
      success: true,
      summary,
      count: report.length,
      vouchers: report,
    });
  } catch (error) {
    console.error("Fee report error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to generate fee report.",
      },
      { status: 500 }
    );
  }
}
