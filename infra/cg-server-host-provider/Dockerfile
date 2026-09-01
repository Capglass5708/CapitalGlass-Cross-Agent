FROM python:3.12-alpine

RUN apk add --no-cache openssh-server shadow \
    && mkdir -p /var/empty /var/run/sshd

COPY dispatch/cg-storage-dispatch.py /usr/local/bin/cg-storage-dispatch
RUN chmod 755 /usr/local/bin/cg-storage-dispatch

COPY sshd_config /etc/ssh/sshd_config
COPY entrypoint.sh /entrypoint.sh
RUN chmod 755 /entrypoint.sh

RUN addgroup -g 100 users 2>/dev/null || true \
    && adduser -D -u 1031 -G users -h /home/cg-context-ledger -s /sbin/nologin cg-context-ledger \
    && mkdir -p /home/cg-context-ledger/.ssh

WORKDIR /vault

EXPOSE 22
ENTRYPOINT ["/entrypoint.sh"]
