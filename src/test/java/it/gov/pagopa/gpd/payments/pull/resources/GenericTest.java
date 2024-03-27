package it.gov.pagopa.gpd.payments.pull.resources;


import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import javax.ws.rs.core.MediaType;

import static io.restassured.RestAssured.given;

@QuarkusTest
class GenericTest {

    @Test
    public void info(){
        given()
                .when().get("/info")
                .then()
                .statusCode(200)
                .contentType(MediaType.APPLICATION_JSON);
    }

    @Test
    public void home(){
        given()
                .when().get("")
                .then()
                .statusCode(200);
    }

}
