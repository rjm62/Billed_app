// /**
//  * @jest-environment jsdom
//  */
import "@testing-library/jest-dom";
import { screen, fireEvent, getByTestId, waitFor } from "@testing-library/dom";
import mockStore from "../__mocks__/store.js";
import NewBill from "../containers/NewBill.js";
import NewBillUI from "../views/NewBillUI.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
jest.mock("../app/Store", () => mockStore);


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then email icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon.className=="active-icon").toBeTruthy()
    })
  })


// VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV

   test("Then I click for a new bill, should a page newBill appear and handleSubmit be called", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
  
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
  
      const newBillTest = new NewBill({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
  
      const formNewBill = screen.getByTestId("form-new-bill")
      expect(formNewBill).toBeTruthy()

      const handleSubmit =jest.fn((e) => newBillTest.handleSubmit(e))
      formNewBill.addEventListener("submit", handleSubmit)
      fireEvent.submit(formNewBill)
      expect(handleSubmit).toBeCalled()
    })
    // VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV

    test("Then bills should update", () => {
      jest.spyOn(mockStore, "bills");
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
  
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
  
      const newBillTest = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })


      const handleSubmit = jest.fn(newBillTest.handleSubmit);
      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(mockStore.bills).toHaveBeenCalled();
      expect(handleSubmit).toBeCalled()
      expect(form).toBeTruthy()
    });


  // test intégration avec POST
  describe("When I am on NewBill Page, I fill the form and I submit", () => {
    test("Then the bill is added to API POST", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = pathname => { document.body.innerHTML = ROUTES({ pathname }) }
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

      const bill = {
        email: "employee@test.tld",
        type: "Hôtel et logement",
        name: "Hôtel de la gare",
        amount: 200,
        date: "2023-09-21",
        vat: "20",
        pct: 5,
        commentary: "",
        fileUrl: "testBill.png",
        fileName: "testBill",
        status: 'pending'
      };

      const typeField = screen.getByTestId("expense-type")
      fireEvent.change(typeField, { target: { value: bill.type } })
      expect(typeField.value).toBe(bill.type)
      const nameField = screen.getByTestId("expense-name")
      fireEvent.change(nameField, { target: { value: bill.name } })
      expect(nameField.value).toBe(bill.name)
      const dateField = screen.getByTestId("datepicker")
      fireEvent.change(dateField, { target: { value: bill.date } })
      expect(dateField.value).toBe(bill.date)
      const amountField = screen.getByTestId("amount")
      fireEvent.change(amountField, { target: { value: bill.amount } })
      expect(parseInt(amountField.value)).toBe(parseInt(bill.amount))
      const vatField = screen.getByTestId("vat")
      fireEvent.change(vatField, { target: { value: bill.vat } })
      expect(parseInt(vatField.value)).toBe(parseInt(bill.vat))
      const pctField = screen.getByTestId("pct")
      fireEvent.change(pctField, { target: { value: bill.pct } })
      expect(parseInt(pctField.value)).toBe(parseInt(bill.pct))
      const commentaryField = screen.getByTestId("commentary")
      fireEvent.change(commentaryField, { target: { value: bill.commentary } })
      expect(commentaryField.value).toBe(bill.commentary)

      const newBillForm = screen.getByTestId("form-new-bill")
      
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      newBillForm.addEventListener("change", handleChangeFile)
      const fileField = screen.getByTestId("file")
      fireEvent.change(fileField, { target: { files: [ new File([bill.fileName], bill.fileUrl, { type: "image/png" }) ] } });
      expect(fileField.files[0].name).toBe(bill.fileUrl) 
      expect(handleChangeFile).toHaveBeenCalled()

      const handleSubmit = jest.fn(newBill.handleSubmit)
      newBillForm.addEventListener("submit", handleSubmit)
      fireEvent.submit(newBillForm)
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
})
