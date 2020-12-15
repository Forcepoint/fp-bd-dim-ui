#!/bin/bash

echo -e "\e[35m"
echo -e "┎────────────────────────────────────────┒"
echo -e "┃                                        ┃"
echo -e "┃      Dynamic Intelligence Manager      ┃"
echo -e "┃                                        ┃"
echo -e "┖────────────────────────────────────────┚"
echo -e "\e[0m"

# Required variables.
rsa_key_size=4096
data_path="./certs"

# Check if docker-compose is installed on the host machine.
if ! [ -x "$(command -v docker-compose)" ]; then
  echo -e '\e[31mError: Docker-compose is not installed.\e[0m' >&2
  exit 1

else
  # Confirm whether the user is using a domain or IP address.
  echo -e ""
  echo -e "\e[94mHow is the Dynamic Intelligence Manager being run?\e[0m"
  echo -e "    \e[94m1)\e[0m Local Development."
  echo -e "    \e[94m2)\e[0m Production."
  echo -e ""
  echo -e -n "\e[94mChoose an option: \e[0m"
  read -p "" option

  if [ "$option" -eq "1" ]; then

    # Running locally means the domain is localhost by default.
    domains=(localhost)

    # Check if local certificates already exist.
    if [ -d "$data_path" ]; then
      echo ""
      echo -e -n "\e[94mExisting certificates found for $domains. Continue and replace existing certificate? (y/n) \e[0m"
      read -p "" decision
      if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
        exit
      fi
    fi

    # Download required SSL parameters.
    if [ ! -e "$data_path/conf/options-ssl-nginx.conf" ] || [ ! -e "$data_path/conf/ssl-dhparams.pem" ]; then
      echo -e "\e[32mDownloading recommended TLS parameters.\e[0m"
      mkdir -p "$data_path/conf"
      curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$data_path/conf/options-ssl-nginx.conf"
      curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$data_path/conf/ssl-dhparams.pem"
      echo -e ""
    fi

    # Create certificates for local deployment.
    echo -e ""
    echo -e "\e[32mCreating self signed certificate for $domains.\e[0m"
    path="/etc/letsencrypt/live/$domains"
    mkdir -p "$data_path/conf/live/$domains"
    docker-compose run --rm --entrypoint "\
      openssl req -x509 -nodes -newkey rsa:1024 -days 1\
        -keyout '$path/privkey.pem' \
        -out '$path/fullchain.pem' \
        -subj '/CN=$domains'" certbot
    echo -e ""

    # Launch Dynamic Intelligence Manager
    echo -e "\e[32mLaunching Dynamic Intelligence Manager.\e[0m"
    docker-compose up --force-recreate -d dim-ui
    echo -e ""

  elif [ "$option" -eq "2" ]; then

    # Check if user has a domain or IP address.
    echo -e ""
    echo -e "\e[94mHow is your instance of Dynamic Intelligence Manager going to be accessible?\e[0m"
    echo -e "    \e[94m1)\e[0m Via the IP address assigned to the docker host."
    echo -e "    \e[94m2)\e[0m Via a Domain Name."
    echo -e ""
    echo -e -n "\e[94mChoose an option: \e[0m"
    read -p "" accessible

    if [ "$accessible" -eq "1" ]; then

      # Request the IP address of the host machine.
      echo -e ""
      echo -e -n "\e[94mWhat is the remote IP address of the Dynamic Intelligence Manager host machine? \e[0m"
      read -p "" address

      # Running locally means the domain is localhost by default.
      domains=("$address")

      # Check if local certificates already exist.
      if [ -d "$data_path" ]; then
        echo ""
        echo -e -n "\e[94mExisting certificates found for $domains. Continue and replace existing certificate? (y/n) \e[0m"
        read -p "" decision
        if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
          exit
        fi
      fi

      # Download required SSL parameters.
      if [ ! -e "$data_path/conf/options-ssl-nginx.conf" ] || [ ! -e "$data_path/conf/ssl-dhparams.pem" ]; then
        echo -e "\e[32mDownloading recommended TLS parameters.\e[0m"
        mkdir -p "$data_path/conf"
        curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$data_path/conf/options-ssl-nginx.conf"
        curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$data_path/conf/ssl-dhparams.pem"
      fi

      # Create certificates for local deployment.
      echo -e ""
      echo -e "\e[32mCreating self signed dummy certificate for $domains.\e[0m"
      path="/etc/letsencrypt/live/$domains"
      mkdir -p "$data_path/conf/live/$domains"
      docker-compose run --rm --entrypoint "\
        openssl req -x509 -nodes -newkey rsa:1024 -days 1\
          -keyout '$path/privkey.pem' \
          -out '$path/fullchain.pem' \
          -subj '/CN=$domains'" certbot
      echo -e ""

      # Final Steps
      echo -e "\e[94mFinal Steps:\e[0m"
      echo -e "Generate or retrieve SSL certificates for your IP address."
      echo -e "Navigate to './certs/conf/live/$address/'"
      echo -e "Replace the 'fullchain.pem' and 'privkey.pem' files with your own certificate and key."
      echo -e "Launch the Dynamic Intelligence Manager using the following command: 'docker-compose up -d'"
      echo -e ""

    elif [ "$accessible" -eq "2" ]; then

      # Request the domain name from the user.
      echo -e ""
      echo -e -n "\e[94mWhat is the domain name of your host machine? \e[0m"
      read -p "" domain

      # Check if the user wishes to generate certs or create new certs.
      echo -e ""
      echo -e "\e[94mHow would you like to provide SSL certificates to the Dynamic Intelligence Manager?\e[0m"
      echo -e "    \e[94m1)\e[0m Generate 90 day free SSL certificates using the Let's Encrypt certificate authority."
      echo -e "    \e[94m2)\e[0m Launch with dummy SSL certificates and then replace with my own ones."
      echo -e ""
      echo -e -n "\e[94mChoose an option: \e[0m"
      read -p "" generate

      # Handle users choice
      if [ "$generate" -eq "1" ]; then

        # Set domain to users entered domain.
        domains=("$domain")

        # Check if local certificates already exist.
        if [ -d "$data_path" ]; then
          echo ""
          echo -e -n "\e[94mExisting certificates found for $domains. Continue and replace existing certificate? (y/n) \e[0m"
          read -p "" decision
          if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
            exit
          fi
        fi

        # Download required SSL parameters.
        if [ ! -e "$data_path/conf/options-ssl-nginx.conf" ] || [ ! -e "$data_path/conf/ssl-dhparams.pem" ]; then
          echo -e "\e[32mDownloading recommended TLS parameters.\e[0m"
          mkdir -p "$data_path/conf"
          curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$data_path/conf/options-ssl-nginx.conf"
          curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$data_path/conf/ssl-dhparams.pem"
        fi

        # Create certificates for local deployment.
        echo -e ""
        echo -e "\e[32mCreating self signed dummy certificate for $domains.\e[0m"
        path="/etc/letsencrypt/live/$domains"
        mkdir -p "$data_path/conf/live/$domains"
        docker-compose run --rm --entrypoint "\
          openssl req -x509 -nodes -newkey rsa:1024 -days 1\
            -keyout '$path/privkey.pem' \
            -out '$path/fullchain.pem' \
            -subj '/CN=$domains'" certbot
        echo -e ""

        # Launch Dynamic Intelligence Manager to generate nginx config.
        echo -e "\e[32mLaunching Dynamic Intelligence Manager\e[0m"
        docker-compose up --force-recreate -d dim-ui
        echo -e ""

        # Delete dummy certificates.
        echo -e "\e[32mDeleting dummy certificate for $domains.\e[0m"
        docker-compose run --rm --entrypoint "\
          rm -Rf /etc/letsencrypt/live/$domains && \
          rm -Rf /etc/letsencrypt/archive/$domains && \
          rm -Rf /etc/letsencrypt/renewal/$domains.conf" certbot
        echo -e ""

        # Build domains argument.
        domain_args=""
        for domain in "${domains[@]}"; do
          domain_args="$domain_args -d $domain"
        done

        # Request users email address.
        echo -e -n "\e[94mWhat is your email address? \e[0m"
        read -p "" email
        echo -e ""

        # Select appropriate email arg
        case "$email" in
          "") email_arg="--register-unsafely-without-email" ;;
          *) email_arg="--email $email" ;;
        esac

        # Run certbot.
        echo -e "\e[32mRequesting Let's Encrypt certificate for $domains.\e[0m"
        docker-compose run --rm --entrypoint "\
          certbot certonly --webroot -w /var/www/certbot \
            $email_arg \
            $domain_args \
            --rsa-key-size $rsa_key_size \
            --agree-tos \
            --force-renewal" certbot
        echo -e ""

        # Launch Dynamic Intelligence Manager
        echo -e "\e[32mLaunching Dynamic Intelligence Manager.\e[0m"
        docker-compose up --force-recreate -d dim-ui
        echo -e ""

        # Final Steps
        echo -e "\e[94mFinal Steps:\e[0m"
        echo -e "Edit the 'docker-compose.yml' file and add the following line to the certbot service"
        echo -e ""
        echo -e "entrypoint: [ \"openssl\", \"req\", \"-x509\", \"-nodes\", \"-newkey', \"rsa:1024\", \"-days', \"1\", \"-keyout\", \"'/etc/letsencrypt/live/$domains/privkey.pem'\", \"-out\", \"'/etc/letsencrypt/live/$domains/fullchain.pem'\", \"-subj\", \"'/CN=$domains'\" ]"
        echo -e ""
        echo -e "This allows certbot to automatically renew the certificates on launch since they are only valid for 90 days."
        echo -e ""

      elif [ "$generate" -eq "2" ]; then

        # Set domain to users entered domain.
        domains=("$domain")

        # Check if local certificates already exist.
        if [ -d "$data_path" ]; then
          echo ""
          echo -e -n "\e[94mExisting certificates found for $domains. Continue and replace existing certificate? (y/n) \e[0m"
          read -p "" decision
          if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
            exit
          fi
        fi

        # Download required SSL parameters.
        if [ ! -e "$data_path/conf/options-ssl-nginx.conf" ] || [ ! -e "$data_path/conf/ssl-dhparams.pem" ]; then
          echo -e "\e[32mDownloading recommended TLS parameters.\e[0m"
          mkdir -p "$data_path/conf"
          curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$data_path/conf/options-ssl-nginx.conf"
          curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$data_path/conf/ssl-dhparams.pem"
        fi

        # Create certificates for local deployment.
        echo -e ""
        echo -e "\e[32mCreating self signed dummy certificate for $domains.\e[0m"
        path="/etc/letsencrypt/live/$domains"
        mkdir -p "$data_path/conf/live/$domains"
        docker-compose run --rm --entrypoint "\
          openssl req -x509 -nodes -newkey rsa:1024 -days 1\
            -keyout '$path/privkey.pem' \
            -out '$path/fullchain.pem' \
            -subj '/CN=$domains'" certbot
        echo -e ""

        # Final Steps
        echo -e "\e[94mFinal Steps:\e[0m"
        echo -e "Generate or retrieve SSL certificates for your domain."
        echo -e "Navigate to './certs/conf/live/$domain/'"
        echo -e "Replace the 'fullchain.pem' and 'privkey.pem' files with your own certificate and key."
        echo -e ""

      else
        echo -e ""
        echo -e '\e[31mError: Invalid option selected.\e[0m' >&2
        exit 1
      fi

    else
      echo -e ""
      echo -e '\e[31mError: Invalid option selected.\e[0m' >&2
      exit 1
    fi

  else
    echo -e ""
    echo -e '\e[31mError: Invalid option selected.\e[0m' >&2
    exit 1
  fi

fi
