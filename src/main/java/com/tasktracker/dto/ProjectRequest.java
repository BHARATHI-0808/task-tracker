package com.tasktracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProjectRequest(

        @NotBlank(message = "Project name is required")
        @Size(max = 255, message = "Name must not exceed 255 characters")
        String name,

        String description
) {}