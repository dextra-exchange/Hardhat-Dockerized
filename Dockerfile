FROM ubuntu:20.04
RUN apt-get update && apt-get install -y sudo curl 

RUN groupadd -r dextra && useradd -r -g dextra dextra
RUN adduser dextra sudo
RUN adduser --disabled-password \
--gecos '' docker
RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> \
/etc/sudoers
RUN curl -sL https://deb.nodesource.com/setup_21.x | bash -
RUN apt-get install -y nodejs
RUN apt-get install -y gcc g++ make
RUN curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | tee /usr/share/keyrings/yarnkey.gpg >/dev/null
RUN echo "deb [signed-by=/usr/share/keyrings/yarnkey.gpg] https://dl.yarnpkg.com/debian stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update && apt-get install -y yarn


RUN mkdir -p /home/dextra
RUN chown -R 999:999 /home/dextra

RUN mkdir -p /project
RUN chown -R 999:999 /project
RUN chmod -R 777 /project

RUN npm install -g npm@7.16.0
RUN npm install -g npm@7.16.0

RUN npm install -g uuid debug
RUN npm install -g @nomiclabs/hardhat-waffle ethereum-waffle chai @nomiclabs/hardhat-ethers ethers
RUN npm install -g hardhat
RUN npm install -g hardhat

USER dextra
WORKDIR /home/dextra

WORKDIR /project

COPY hardhat.config.js /project/hardhat.config.js
RUN npm install --save-dev "hardhat@^2.22.7"
RUN npm install --save-dev "@nomicfoundation/hardhat-toolbox"
#ENTRYPOINT ["/bin/bash"]
#CMD ["/usr/bin/npx", "hardhat, "node"]
#CMD ["/usr/bin/npx hardhat node"]
#RUN npx hardhat node > /dev/null &
#CMD ["bash", "-c", "while true; do sleep 30; done"]
