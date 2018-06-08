# -*- coding: utf-8 -*-
"""find countours from image and send the result to stdout"""
from frame import lastframe, tostdout

def main():
    import cv2

    frame = lastframe()
    imgray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(imgray, 127, 255, 0)
    thresh, contours, _ = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    img_countours = cv2.drawContours(frame, contours, -1, (0, 255, 0), 3)

    tostdout(img_countours)


if __name__ == '__main__':
    main()
