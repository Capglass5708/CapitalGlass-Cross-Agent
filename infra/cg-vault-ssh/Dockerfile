FROM python:3.12-alpine

RUN apk add --no-cache openssh-server rsync shadow \
    && mkdir -p /var/empty /var/run/sshd

COPY cg-vault-dispatch.py /usr/local/bin/cg-vault-dispatch
RUN chmod 755 /usr/local/bin/cg-vault-dispatch

COPY sshd_config /etc/ssh/sshd_config
COPY entrypoint.sh /entrypoint.sh
RUN chmod 755 /entrypoint.sh

# Non-root runtime identity for file operations inside ForceCommand
RUN addgroup -g 100 users 2>/dev/null || true \
    && adduser -D -u 1031 -G users -h /home/vault -s /bin/sh vault \
    && mkdir -p /home/vault/.ssh

WORKDIR /vault

EXPOSE 22
ENTRYPOINT ["/entrypoint.sh"]
