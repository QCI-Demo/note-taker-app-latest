/**
 * Web persistence: reload verifies Dexie/IndexedDB. Native app restarts are
 * covered separately (Capacitor / Appium); not run in this headless web suite.
 */
describe("Offline persistence (IndexedDB)", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("keeps three notes across page reload", () => {
    const notes = [
      { title: "Persist A", body: "Body A" },
      { title: "Persist B", body: "Body B" },
      { title: "Persist C", body: "Body C" },
    ];

    for (const n of notes) {
      cy.get('[data-testid="add-note-button"]').click();
      cy.get('[data-testid="create-note-modal"]').should("be.visible");
      cy.get("#create-note-title").clear().type(n.title);
      cy.get("#create-note-body").clear().type(n.body);
      cy.get('[data-testid="create-note-submit"]').click();
      cy.get('[data-testid="create-note-modal"]').should("not.exist");
    }

    cy.get('[data-testid="note-list"] li').should("have.length", 3);

    cy.reload();

    cy.contains('[data-testid="note-list"] li', "Persist A").should(
      "be.visible",
    );
    cy.contains('[data-testid="note-list"] li', "Persist B").should(
      "be.visible",
    );
    cy.contains('[data-testid="note-list"] li', "Persist C").should(
      "be.visible",
    );
  });
});
