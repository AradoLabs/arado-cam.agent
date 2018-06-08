# -*- coding: utf-8 -*-
"""load and print captured frames"""
import sys
import numpy
import cv2

def decode(binary_frame):
    """decode frame"""
    frame_bytearray = bytearray(binary_frame)
    frame_array = numpy.frombuffer(frame_bytearray, dtype='uint8')
    frame = cv2.imdecode(frame_array, 1)

    return frame

def find_frames(cameraFrames = 'leftCameraFrames'):
    """get left camera frames"""

    from pymongo import MongoClient

    sys.argv.append('test-bot-id')

    if len(sys.argv) < 2:
        raise Exception('first argument should be the botId')

    bot_id = sys.argv[1]
    client = MongoClient('mongodb://localhost:27017/')
    database = client.arado-cam
    bot = database.bots.find_one({"botId": bot_id})

    return bot['leftCameraFrames']

def allframes():
    """get all stored frames"""

    frames = find_frames()
    decoded = map(decode, frames)

    return decoded


def lastframe(cameraFrames = 'leftCameraFrames'):
    """get the last stored frame"""

    frames = find_frames()
    frame = frames[-1]
    decoded = decode(frame)

    return decoded


def tostdout(frame):
    """print frame to stdout"""

    _, buf = cv2.imencode('.jpg', frame)
    result = buf.ravel()
    result.tofile(sys.stdout)
    sys.stdout.flush()
