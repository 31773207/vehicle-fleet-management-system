package com.bank.pfe1.entity;

public enum VehicleStatus {
    ACTIVE,       // ✅ Available, free to assign
    ASSIGNED,     // 🔒 Assigned to driver, not on mission
    IN_MISSION,   // 🚗 Currently on a mission
    IN_REVISION,  // 🔍 Being inspected
    BREAKDOWN,    // 🔧 Broken down
    REFORMED      // 🪦 Retired forever
}