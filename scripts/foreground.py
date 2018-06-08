# -*- coding: utf-8 -*-
"""find foreground (i.e.moving objects) and send the result to stdout"""
from frame import allframes, tostdout

def main():
    import cv2

    frames = allframes()
    fgbg = cv2.createBackgroundSubtractorMOG2(detectShadows=False)
    fgmask = None

    for frame in frames:
        fgmask = fgbg.apply(frame)

    # imgray = cv2.cvtColor(fgmask, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(fgmask, 127, 255, 0)
    thresh, contours, _ = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    img_countours = cv2.drawContours(frame, contours, -1, (0, 255, 0), 3)

    tostdout(img_countours)


if __name__ == '__main__':
    main()
