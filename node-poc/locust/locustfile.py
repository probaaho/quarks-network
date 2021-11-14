import random
from datetime import datetime

from locust import HttpUser, task, between


class WebUser(HttpUser):
    wait_time = between(1, 5)
    host = "http://"

    no_executor_api = "async/zxcvbn2"
    customer_executor_api = "zxcvbn2"

    centralized_users = ['alice@org.com', 'bob@org.com', 'charlie@org.com']
    centralized_token = 'qwerty12345'
    centralized_channels = ['channel-123', 'channel-23', 'channel-1']

    api_centralized_send_message = 'localhost:3000/sendMessage'
    api_centralized_read_message = 'localhost:3000/readMessage'

    @task
    def centralized_send_message(self):
        user_email = random.choice(self.centralized_users)
        user_channel = random.choice(self.centralized_channels)
        user_text = self.generate_text(username=user_email)

        json_body = {
            "email": user_email,
            "text": user_text,
            "channel": user_channel
        }

        headers = {
            'token': self.centralized_token
        }

        self.client.post(url=self.api_centralized_send_message, json=json_body, headers=headers)

    @task
    def centralized_read_message(self):
        user_email = random.choice(self.centralized_users)
        user_channel = random.choice(self.centralized_channels)

        json_body = {
            "email": user_email,
            "channel": user_channel
        }

        headers = {
            'token': self.centralized_token
        }

        self.client.post(url=self.api_centralized_read_message, json=json_body, headers=headers)

    def generate_text(self, username):
        return 'I am {}. current time is {}'.format(username, datetime.now())
