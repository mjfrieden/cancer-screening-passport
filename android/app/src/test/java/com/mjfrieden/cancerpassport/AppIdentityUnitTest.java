package com.mjfrieden.cancerpassport;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class AppIdentityUnitTest {

    @Test
    public void appId_isProductionPackage() {
        assertEquals("com.mjfrieden.cancerpassport", BuildConfig.APPLICATION_ID);
    }
}
