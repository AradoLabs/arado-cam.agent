# -*- coding: utf-8 -*-
"""find humans from image and send the result to stdout"""
from frame import lastframe, tostdout

def main():
    import cv2

    frame = lastframe('rightCameraFrames')

    hog = cv2.HOGDescriptor()
    hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())

    # frame = cv2.resize(frame, (0,0), fx=0.25, fy=0.25)
    (rects, _) = hog.detectMultiScale(frame, winStride=(4, 4), padding=(8, 8), scale=1.05)

    for (x, y, w, h) in rects:
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 2)

    tostdout(frame)

if __name__ == "__main__":
    main()
