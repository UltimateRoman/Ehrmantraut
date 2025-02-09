from fastapi import FastAPI
import RPi.GPIO as GPIO
import time

SERVO_PIN = 18  # GPIO for Servo
TRIG_PIN = 23  # GPIO for Ultrasonic Sensor TRIG
ECHO_PIN = 24  # GPIO for Ultrasonic Sensor ECHO
LDR_PIN = 12  # GPIO for LDR Sensor

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)

GPIO.setup(SERVO_PIN, GPIO.OUT)
GPIO.setup(TRIG_PIN, GPIO.OUT)
GPIO.setup(ECHO_PIN, GPIO.IN)

pwm = GPIO.PWM(SERVO_PIN, 50)  # 50Hz frequency
pwm.start(0)

OPEN_ANGLE = 10
CLOSED_ANGLE = 105
door_state = "closed"

app = FastAPI()

print("Starting FastAPI server...")

def set_servo_angle(angle):
    """ Move servo to a specific angle """
    duty_cycle = angle / 18 + 2
    pwm.ChangeDutyCycle(duty_cycle)
    time.sleep(0.5)
    pwm.ChangeDutyCycle(0)

def read_ldr():
    """ Returns 'dark' if LDR sees low light, otherwise 'bright' """
    GPIO.setup(LDR_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    light = GPIO.input(LDR_PIN) 
    return "dark" if light else "bright"

def get_distance():
    """ Measure distance using ultrasonic sensor """
    GPIO.output(TRIG_PIN, True)
    time.sleep(0.00001)
    GPIO.output(TRIG_PIN, False)
    start_time, end_time = 0, 0
    # Wait for ECHO to go HIGH
    while GPIO.input(ECHO_PIN) == 0:
        start_time = time.time()
    # Wait for ECHO to go LOW
    while GPIO.input(ECHO_PIN) == 1:
        end_time = time.time()
    elapsed_time = end_time - start_time
    distance = (elapsed_time * 34300) / 2
    return round(distance, 2)

@app.get("/toggle")
async def toggle_door():
    global door_state
    if door_state == "closed":
        set_servo_angle(OPEN_ANGLE)
        door_state = "open"
    else:
        set_servo_angle(CLOSED_ANGLE)
        door_state = "closed"
    return {"status": "success", "door": door_state}

@app.get("/status")
async def get_status():
    return {"door": door_state}

@app.get("/distance")
async def check_distance():
    """ API to check ultrasonic sensor distance """
    distance = get_distance()
    return {"distance_cm": distance}

@app.get("/ldr")
async def check_ldr():
    """ API to check light status (bright or dark) """
    light_value = read_ldr()
    return {"light_value": light_value}

@app.on_event("shutdown")
def cleanup():
    pwm.stop()
    GPIO.cleanup()