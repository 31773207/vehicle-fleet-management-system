package com.bank.pfe1;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling  // Add this

public class Pfe1Application {

    public static void main(String[] args) {
        SpringApplication.run(Pfe1Application.class, args);
    }

}

