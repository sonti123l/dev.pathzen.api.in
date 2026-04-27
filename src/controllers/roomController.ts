import { db } from "../db/db.js";
import { rooms } from "../db/schema/room.js";
import { getStatusMessage } from "../helpers/constants/messageForStatusCodes.js";
import { StatusCodes } from "../helpers/constants/statusCodes.js";
import { createLiveInput, getRecordingUrl } from "../validations/cloudflare.js";
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
    } else {
      // call cloudflare
      const { liveInputId, streamKey, hlsUrl } = await createLiveInput(
        payload?.title,
      );

      //   now store data into DB
      roomId = crypto.randomUUID();
      const insertRoomDetailsIntoRoom = await db
        .insert(rooms)
        .values({
          id: roomId,
          title: payload?.title,
          liveInputId: liveInputId,
          streamKey: streamKey,
          hlsUrl: hlsUrl,
          status: "live",
          createdBy: payload?.createdBy,
          subModuleId: subModuleId,
        })
        .$returningId();

      if (roomId) {
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
    }
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

    statusCode = StatusCodes.OK;
    statusCodeMessage = getStatusMessage(statusCode);
    resultResponse = createDataSchemaAndReturnIt({
      status: statusCode,
      message: statusCodeMessage,
      success: true,
      data: {
        hls_url: activeLive[0].hlsUrl,
        room_id: activeLive[0].id,
      },
    });
    return resultResponse;
  }

  async endLive({ roomId, payload }: { roomId: string; payload: { role: string } }) {
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

  // wait for Cloudflare to process recording
  await new Promise((r) => setTimeout(r, 5000));

  // get recording url
  const recordingUrl = await getRecordingUrl(roomData[0].liveInputId!);

  // update room status
  await db
    .update(rooms)
    .set({ status: "ended", recordingUrl })
    .where(eq(rooms.id, roomId));

  statusCode = StatusCodes.OK;
  statusCodeMessage = getStatusMessage(statusCode);
  resultResponse = createDataSchemaAndReturnIt({
    status: statusCode,
    message: statusCodeMessage,
    success: true,
    data: {
      message: "Live ended successfully",
      recording_url: recordingUrl,
    },
  });
  return resultResponse;
}
}

export const roomController = new RoomController();
