import { db } from "../db/db.js";
import { rooms } from "../db/schema/room.js";
import { getStatusMessage } from "../helpers/constants/messageForStatusCodes.js";
import { StatusCodes } from "../helpers/constants/statusCodes.js";
import { createLiveInput, checkIsStreamLive, getRecordingUrl } from "../validations/cloudflare.js";
import createDataSchemaAndReturnIt from "../zod/dataSchema.js";
import { eq, and } from "drizzle-orm";

class RoomController {
  async createLiveInputForTeacher({
    subModuleId,
    payload,
  }: {
    subModuleId: number;
    payload: { title: string; createdBy: string; role: string };
  }) {
    let statusCode;
    let statusCodeMessage;
    let resultResponse;
    let roomId;

    if (payload?.role !== "TEACHER") {
      statusCode = StatusCodes.FORBIDDEN;
      statusCodeMessage = getStatusMessage(statusCode);

      resultResponse = createDataSchemaAndReturnIt({
        status: statusCode,
        message: statusCodeMessage,
        success: false,
        data: {
          message: "Not Allowed to create live",
        },
      });

      return resultResponse;
    }

    const checkIsRoleAlreadyInLive = await db
      .select()
      .from(rooms)
      .where(and(eq(rooms.subModuleId, subModuleId), eq(rooms.status, "live")));

    if (checkIsRoleAlreadyInLive?.length > 0) {
      statusCode = StatusCodes.BAD_REQUEST;
      statusCodeMessage = getStatusMessage(statusCode);

      resultResponse = createDataSchemaAndReturnIt({
        status: statusCode,
        message: statusCodeMessage,
        success: false,
        data: {
          message: "Already Live",
        },
      });
      return resultResponse;
    }

    // call cloudflare
    const {
      liveInputId,
      streamKey,
      hlsUrl,
      iframeUrl,
    } = await createLiveInput(payload?.title);

    // store data into DB
    roomId = crypto.randomUUID();
    await db
      .insert(rooms)
      .values({
        id: roomId,
        title: payload?.title,
        liveInputId: liveInputId,
        streamKey: streamKey,
        hlsUrl: hlsUrl,
        iframeUrl, 
        status: "live",
        createdBy: payload?.createdBy,
        subModuleId: subModuleId,
      })
      .$returningId();

    statusCode = StatusCodes.OK;
    statusCodeMessage = getStatusMessage(statusCode);
    resultResponse = createDataSchemaAndReturnIt({
      status: statusCode,
      message: statusCodeMessage,
      success: true,
      data: {
        room_id: roomId,
        stream_key: streamKey,
        live_input_id: liveInputId,
      },
    });

    return resultResponse;
  }

  async getActiveLive({ subModuleId }: { subModuleId: number }) {
    let statusCode;
    let statusCodeMessage;
    let resultResponse;

    const activeLive = await db
      .select()
      .from(rooms)
      .where(and(eq(rooms.subModuleId, subModuleId), eq(rooms.status, "live")))
      .limit(1);

    if (activeLive.length === 0) {
      statusCode = StatusCodes.NOT_FOUND;
      statusCodeMessage = getStatusMessage(statusCode);
      resultResponse = createDataSchemaAndReturnIt({
        status: statusCode,
        message: statusCodeMessage,
        success: false,
        data: {
          message: "No live class right now",
        },
      });
      return resultResponse;
    }

    if (!activeLive[0].liveInputId) {
      statusCode = StatusCodes.NOT_FOUND;
      statusCodeMessage = getStatusMessage(statusCode);
      resultResponse = createDataSchemaAndReturnIt({
        status: statusCode,
        message: statusCodeMessage,
        success: false,
        data: {
          message: "Live stream URL not available yet",
        },
      });
      return resultResponse;
    }

    // We return the iframeUrl immediately. The Cloudflare Stream player natively
    // handles the "Waiting for broadcast" state and will auto-play as soon as
    // the teacher's WHIP stream successfully connects and starts flowing.
    statusCode = StatusCodes.OK;
    statusCodeMessage = getStatusMessage(statusCode);
    resultResponse = createDataSchemaAndReturnIt({
      status: statusCode,
      message: statusCodeMessage,
      success: true,
      data: {
        room_id: activeLive[0].id,
        iframe_url: activeLive[0].iframeUrl,
      },
    });
    return resultResponse;
  }

  async endLive({
    roomId,
    payload,
  }: {
    roomId: string;
    payload: { role: string };
  }) {
    let statusCode;
    let statusCodeMessage;
    let resultResponse;

    if (payload?.role !== "TEACHER") {
      statusCode = StatusCodes.FORBIDDEN;
      statusCodeMessage = getStatusMessage(statusCode);
      resultResponse = createDataSchemaAndReturnIt({
        status: statusCode,
        message: statusCodeMessage,
        success: false,
        data: { message: "Not Allowed" },
      });
      return resultResponse;
    }

    const roomData = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, roomId))
      .limit(1);

    if (roomData.length === 0) {
      statusCode = StatusCodes.NOT_FOUND;
      statusCodeMessage = getStatusMessage(statusCode);
      resultResponse = createDataSchemaAndReturnIt({
        status: statusCode,
        message: statusCodeMessage,
        success: false,
        data: { message: "Room not found" },
      });
      return resultResponse;
    }

    // FIX: Mark room as ended in DB immediately so students stop seeing the live
    // BEFORE waiting for Cloudflare recording — this unblocks the student view right away
    await db.update(rooms).set({ status: "ended" }).where(eq(rooms.id, roomId));

    // Now fetch recording URL from Cloudflare in the background (non-blocking)
    // We respond to the teacher immediately and update recordingUrl async
    setImmediate(async () => {
      try {
        // Give Cloudflare time to process the recording
        await new Promise((r) => setTimeout(r, 10000));
        const recordingUrl = await getRecordingUrl(roomData[0].liveInputId!);
        await db
          .update(rooms)
          .set({ recordingUrl })
          .where(eq(rooms.id, roomId));
        console.log(
          `[RoomController] Recording URL saved for room ${roomId}:`,
          recordingUrl,
        );
      } catch (err) {
        console.error(
          `[RoomController] Failed to fetch recording URL for room ${roomId}:`,
          err,
        );
      }
    });

    statusCode = StatusCodes.OK;
    statusCodeMessage = getStatusMessage(statusCode);
    resultResponse = createDataSchemaAndReturnIt({
      status: statusCode,
      message: statusCodeMessage,
      success: true,
      data: {
        message: "Live ended successfully",
      },
    });
    return resultResponse;
  }
}

export const roomController = new RoomController();
