FROM gradle:jdk8-alpine AS build
COPY --chown=gradle . /app/
WORKDIR /app/
RUN gradle build gen

FROM openjdk:8-alpine
COPY --from=build /app/build/libs/ipass.jar /tmp/
RUN apk add libxext libxrender libxtst fontconfig
RUN adduser -D -h /home/ipass/ ipass
USER ipass
ENTRYPOINT ["java", "-jar", "/tmp/ipass.jar"]
