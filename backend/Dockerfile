FROM python:3.10-alpine

ENV PYTHONUNBUFFERED 1

WORKDIR /django
COPY ./requirements.txt /tmp/requirements.txt

EXPOSE 8000

RUN python -m venv /py && \
    /py/bin/pip install --upgrade pip && \
    apk add --update --no-cache \
        postgresql-client \
        jpeg-dev \
        libpq \
        ffmpeg \
        zlib \
        && \
    apk add --update --no-cache --virtual .tmp-build-deps \
        build-base \
        postgresql-dev \
        musl-dev \
        libffi-dev \
        openssl-dev \
        zlib-dev \
        && \
    /py/bin/pip install -r /tmp/requirements.txt && \
    rm -rf /tmp && \
    apk del .tmp-build-deps && \
    adduser \
        --disabled-password \
        --no-create-home \
        django-user && \
    mkdir -p /vol/web/media && \
    mkdir -p /vol/web/static && \
    chown -R django-user:django-user /vol && \
    chown -R django-user:django-user /django && \
    chmod -R 755 /vol

COPY . .


ENV PATH="/py/bin:$PATH"

USER django-user
