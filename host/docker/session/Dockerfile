FROM nvidia/cuda:12.9.1-runtime-ubuntu24.04

LABEL maintainer="Team-SKM"
LABEL description="GPU Session Container"

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y \
        openssh-server \
        python3 \
        python3-pip \
        git \
        curl \
        nano \
        iproute2 \
        procps \
        ca-certificates \
        tzdata && \
    rm -rf /var/lib/apt/lists/*

RUN useradd -m -s /bin/bash renter && \
    echo "renter:password" | chpasswd

RUN mkdir /var/run/sshd

COPY sshd_config /etc/ssh/sshd_config

COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 22

ENTRYPOINT ["/entrypoint.sh"]