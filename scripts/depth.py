# -*- coding: utf-8 -*-
"""calculate depthmap from images and send the result to stdout"""

def main():
    import matplotlib
    matplotlib.use('Agg')

    import cv2
    import StringIO
    from matplotlib import pyplot as plt
    from frame import lastframe, tostdout
    import numpy as np

    leftFrame = lastframe('leftCameraFrames')
    rightFrame = lastframe('rightCameraFrames')

    leftGray = cv2.cvtColor(leftFrame, cv2.COLOR_BGR2GRAY)
    rightGray = cv2.cvtColor(rightFrame, cv2.COLOR_BGR2GRAY)

    stereo = cv2.StereoBM_create(numDisparities=16, blockSize=15)
    disparity = stereo.compute(leftGray,rightGray)
    
    imgplot = plt.imshow(disparity,'gray')
    # imgplot = plt.imshow(leftFrame)
    fig = plt.gcf()
    # imgdata = StringIO.StringIO()
    # fig.savefig(imgdata, format='png')
    # imgdata.seek(0)  # rewind the data
    fig.canvas.draw()

    # Now we can save it to a numpy array.
    data = np.fromstring(fig.canvas.tostring_rgb(), dtype=np.uint8, sep='')
    data = data.reshape(fig.canvas.get_width_height()[::-1] + (3,))

    tostdout(data)


if __name__ == '__main__':
    main()
