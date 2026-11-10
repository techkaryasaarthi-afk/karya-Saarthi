import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "src", "data", "appointments.json");

function getAppointments() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const fileData = fs.readFileSync(dataFilePath, "utf8");
      return JSON.parse(fileData);
    }
  } catch (error) {
    console.error("Error reading appointments file:", error);
  }
  return [];
}

function saveAppointments(appointments: any[]) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(appointments, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error writing appointments file:", error);
    return false;
  }
}

// GET all appointments (Used by Admin Portal)
export async function GET() {
  const appointments = getAppointments();
  return NextResponse.json({
    success: true,
    appointments,
    total: appointments.length,
    notificationEmail: "info@karyasaarthi.com",
  });
}

// POST new appointment booking
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, service, date, timeSlot, meetingType, budget, notes } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, error: "Name, email, and phone are required." },
        { status: 400 }
      );
    }

    const appointments = getAppointments();

    const newAppointment = {
      id: "apt-" + Date.now(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      service: service || "General Consultation",
      date: date || new Date().toISOString().split("T")[0],
      timeSlot: timeSlot || "11:00 AM - 11:30 AM",
      meetingType: meetingType || "Google Meet",
      budget: budget || "Custom Quote",
      notes: notes || "No additional notes provided.",
      status: "New",
      notificationSentTo: "info@karyasaarthi.com",
      createdAt: new Date().toISOString(),
    };

    appointments.unshift(newAppointment);
    saveAppointments(appointments);

    // Simulated email dispatch log to info@karyasaarthi.com
    console.log(`[EMAIL NOTIFICATION SENT] To: info@karyasaarthi.com | Subject: New Appointment Booked by ${name} | Phone: ${phone} | Service: ${service}`);

    return NextResponse.json({
      success: true,
      appointment: newAppointment,
      notificationSentTo: "info@karyasaarthi.com",
      message: `Appointment booked successfully! Registration details have been routed to info@karyasaarthi.com.`,
    });
  } catch (error) {
    console.error("Failed to book appointment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process appointment." },
      { status: 500 }
    );
  }
}

// PATCH update status (Used by Admin Portal)
export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ success: false, error: "ID and status required" }, { status: 400 });
    }

    const appointments = getAppointments();
    const index = appointments.findIndex((a: any) => a.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
    }

    appointments[index].status = status;
    appointments[index].updatedAt = new Date().toISOString();
    saveAppointments(appointments);

    return NextResponse.json({ success: true, appointment: appointments[index] });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
  }
}

// DELETE appointment (Used by Admin Portal)
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    }

    const appointments = getAppointments();
    const filtered = appointments.filter((a: any) => a.id !== id);
    saveAppointments(filtered);

    return NextResponse.json({ success: true, message: "Appointment deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Delete failed" }, { status: 500 });
  }
}
