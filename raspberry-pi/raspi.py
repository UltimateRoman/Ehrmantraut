import RPi.GPIO as GPIO
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi import Depends, HTTPException, Header
from fastapi.security import OAuth2PasswordBearer
import time
import threading


app = FastAPI()

GPIO.cleanup()
GPIO.setmode(GPIO.BCM)

STEP_PIN_1 = 27
STEP_PIN_2 = 22
STEP_PIN_3 = 5
STEP_PIN_4 = 6
PIR_PIN = 17

GPIO.setup(STEP_PIN_1, GPIO.OUT)
GPIO.setup(STEP_PIN_2, GPIO.OUT)
GPIO.setup(STEP_PIN_3, GPIO.OUT)
GPIO.setup(STEP_PIN_4, GPIO.OUT)
GPIO.setup(PIR_PIN, GPIO.IN)

step_sequence = [
    [1, 0, 0, 0],
    [1, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 1, 1],
    [0, 0, 0, 1],
    [1, 0, 0, 1]
]

motion_detected = False

def move_stepper(steps):
    """Function to move stepper motor"""
    if steps > 0:
        for _ in range(steps):
            for step in step_sequence:
                GPIO.output(STEP_PIN_1, step[0])
                GPIO.output(STEP_PIN_2, step[1])
                GPIO.output(STEP_PIN_3, step[2])
                GPIO.output(STEP_PIN_4, step[3])
                time.sleep(0.005)
    else:
        steps = abs(steps)
        for _ in range(steps):
            for step in reversed(step_sequence):
                GPIO.output(STEP_PIN_1, step[0])
                GPIO.output(STEP_PIN_2, step[1])
                GPIO.output(STEP_PIN_3, step[2])
                GPIO.output(STEP_PIN_4, step[3])
                time.sleep(0.005)

def rotate_motor():
    print("Rotating motor 90 degrees.")
    move_stepper(128)

    time.sleep(5)

    print("Rotating motor back to original position.")
    move_stepper(-128)


CLIENT_ID = ""
CLIENT_SECRET = ""

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def verify_client_credentials(client_id: str = Header(...), client_secret: str = Header(...)):
    """Verify if the client credentials are correct"""
    if client_id != CLIENT_ID or client_secret != CLIENT_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

@app.get("/motion")
async def get_motion_status(client_valid: bool = Depends(verify_client_credentials)):
    """Endpoint to get the current status of the motion sensor"""
    if GPIO.input(PIR_PIN):
        return JSONResponse(content={"motion": True}, status_code=200)
    else:
        return JSONResponse(content={"motion": False}, status_code=200)

@app.post("/toggle")
async def trigger_motor(client_valid: bool = Depends(verify_client_credentials)):
    """Endpoint to trigger the motor to rotate"""
    motor_thread = threading.Thread(target=rotate_motor)
    motor_thread.start()

    return JSONResponse(content={"status": "success"}, status_code=200)