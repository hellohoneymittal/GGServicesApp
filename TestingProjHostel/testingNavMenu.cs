 <div class="popup" id="adminHomeContainer">
        <div class="popup-content">
          <!-- Nav Menu Bar -->
          <button
            class="leftSideNav-menuBtn"
            onclick="openLeftNavBar('leftSideNavAdmin', 'GURUKUL SERVANTS')"
          >
            ☰ GURUKUL SERVANTS
          </button>

          <div id="leftSideNavAdmin" class="leftSideNav">
            <a
              href="#allServiceList"
              class="leftNavBar-dynamicNavLink"
              data-form="allServiceList"
              >All Service List</a
            >

            <a
              href="#myServices"
              class="leftNavBar-dynamicNavLink"
              data-form="myServices"
              >My Services</a
            >

            <a
              href="#ggStudentServices"
              class="leftNavBar-dynamicNavLink"
              data-form="ggStudentServices"
              >GG Student Service</a
            >

            <a
              href="#feedBackForm"
              class="leftNavBar-dynamicNavLink"
              data-form="feedBackForm"
              >Feedback Form</a
            >

            <a
              href="#actionPoint"
              class="leftNavBar-dynamicNavLink"
              data-form="actionPoint"
              >Action Point</a
            >

            

          </div>

          <div class="leftSideNav-contentContainer">
            <div
              id="allServiceList"
              style="display: block"
              class="popup-content scrollable-content leftSideNav-itemContainer"
            >
              <div style="position: relative; display: inline-block">
                <span style="font-size: 24px">🔔</span>
                <span
                  id="orderBadge"
                  style="
                    position: absolute;
                    top: 0;
                    right: 0;
                    background: red;
                    color: white;
                    font-size: 12px;
                    padding: 2px 6px;
                    border-radius: 50%;
                    display: none;
                  "
                ></span>
              </div>
              <div class="custom-control-row">
                <div class="left-side-control">
                  <div class="liveSearchContainer">
                    <input
                      type="text"
                      id="adminCustName"
                      class="liveSearch"
                      placeholder="Customer Name..."
                    />
                    <button class="liveSearchClearBtn" id="adminCustNameClrBtn">
                      &times;
                    </button>
                    <ul id="adminCustNameULList" class="liveSearchUL"></ul>
                  </div>
                </div>
                <div class="right-side-control">
                  <img
                    style="height: 35px !important"
                    src="https://imghost.net/ib/E5PegaLvH4xfUED_1729512954.png"
                    border="0"
                    alt="Add User"
                    onclick="addNewUserButtonClick()"
                  />
                </div>
              </div>

              <div>
                <div class="liveSearchContainer">
                  <input
                    type="text"
                    id="adminItemInput"
                    class="liveSearch"
                    placeholder="Item..."
                  />
                  <button class="liveSearchClearBtn" id="adminItemInputClrBtn">
                    &times;
                  </button>
                  <ul id="adminItemInputULList" class="liveSearchUL"></ul>
                </div>
              </div>
              <div style="display: flex; align-items: center">
                <div style="flex: 1 1 35%; padding-right: 10px">
                  <input
                    type="text"
                    id="adminQuantityInput"
                    placeholder="Quantity..."
                    inputmode="numeric"
                    oninput="restrictToNumberWithDecimalAndNegative(this)"
                  />
                </div>
                <div style="flex: 1 1 35%; padding-right: 10px">
                  <input
                    type="text"
                    id="adminDisInput"
                    inputmode="numeric"
                    placeholder="Discount..."
                    oninput="restrictToNumberWithDecimal(this)"
                  />
                </div>
                <div
                  style="
                    margin-top: -10px;
                    flex: 0 0 15%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  "
                >
                  <button
                    class="green"
                    id="addItemInBillBtn"
                    onclick="addItemInBill()"
                  >
                    +
                  </button>
                </div>
              </div>
              <div class="sale-selected-items">
                <h3>Selected Items</h3>
                <div
                  class="collection-table-container scrollable-content-table"
                  id="production-selected-items-table"
                  style="margin-top: 20px"
                >
                  <table id="adSaleTable">
                    <thead id="adSaleTableTHead" class="table-header">
                      <tr>
                        <th>Action</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Disc.</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody id="adSaleTableTBody">
                      <!-- Table rows will be dynamically generated here -->
                    </tbody>
                  </table>
                </div>
              </div>
              <div
                style="display: flex; align-items: center; margin-bottom: 10px"
              >
                <div style="flex: 1 1 30%; padding-right: 10px">Payment:</div>
                <div
                  style="
                    flex: 1 1 65%;
                    padding-right: 10px;
                    align-items: center;
                    justify-content: center;
                  "
                >
                  <input
                    type="radio"
                    name="paymentStatus"
                    value="paid"
                    id="paidStatus"
                  />
                  Paid
                  <input
                    type="radio"
                    name="paymentStatus"
                    value="pending"
                    id="pendingStatus"
                  />
                  Pending
                </div>
              </div>
              <div
                style="display: flex; align-items: center; margin-bottom: 10px"
              >
                <div style="flex: 1 1 30%; padding-right: 10px">Sale Type:</div>
                <div
                  style="
                    flex: 1 1 65%;
                    padding-right: 24px;
                    align-items: center;
                    justify-content: center;
                  "
                >
                  <input
                    type="radio"
                    name="saleType"
                    value="Bank"
                    id="bankSale"
                    checked
                  />
                  Bank
                  <input
                    type="radio"
                    name="saleType"
                    value="Cash"
                    id="cashSale"
                  />
                  Cash
                </div>
              </div>
              <div>
                <input
                  type="input"
                  placeholder="Comments if any..."
                  id="commentsSaleInput"
                />
              </div>
              <div class="total-row-container custom-control-row">
                <div class="left">
                  <button class="green" onclick="submitOrder()">
                    Generate Bill
                  </button>
                </div>
                <div class="right">
                  <div class="total-cost" id="totalCost">Total: ₹0</div>
                </div>
              </div>
            </div>

            <div
              id="adminProduction"
              class="popup-content scrollable-content leftSideNav-itemContainer"
            >
              <div class="custom-control-row">
                <div class="left-side-control">
                  <div class="liveSearchContainer">
                    <input
                      type="text"
                      id="adminProductionInput"
                      class="liveSearch"
                      placeholder="Select Item..."
                    />
                    <button
                      class="liveSearchClearBtn"
                      id="adminProductionInputClrBtn"
                    >
                      &times;
                    </button>
                    <ul
                      id="adminProductionInputULList"
                      class="liveSearchUL"
                    ></ul>
                  </div>
                </div>
              </div>
              <div class="control-row">
                <div>
                  <input type="date" id="batchDate" required />
                </div>
                <div>
                  <input
                    type="text"
                    id="productionCountInput"
                    placeholder="Prod Count..."
                    pattern="[0-9]{10}"
                    oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                    maxlength="11"
                    inputmode="numeric"
                    required
                  />
                </div>
              </div>
              <div class="custom-control-row">
                <div class="left-side-control">
                  <input
                    type="input"
                    placeholder="Comments if any..."
                    id="commentsInput"
                  />
                </div>

                <div class="right-side-control" style="margin-top: -10px">
                  <button
                    class="green"
                    id="productionInputBtn"
                    onclick="productionInput()"
                  >
                    +
                  </button>
                </div>
              </div>
              <div
                class="collection-table-container scrollable-content-table"
                id="production-selected-items-table"
                style="margin-top: 20px"
              >
                <table id="piTable">
                  <thead id="piTableTHead" class="table-header">
                    <tr>
                      <th>Action</th>
                      <th>Selected Item</th>
                      <th>Batch Date</th>
                      <th>Production Count</th>
                      <th>Comments</th>
                    </tr>
                  </thead>
                  <tbody id="piTableTBody">
                    <!-- Table rows will be dynamically generated here -->
                  </tbody>
                </table>
              </div>

              <button class="green" onclick="submitProduction()">
                Submit Production
              </button>
            </div>

            <div
              id="adminOrderList"
              class="popup-content scrollable-content leftSideNav-itemContainer"
            >
              <div id="adminOrderListView"></div>
            </div>
          </div>

         
         
        </div>
      </div>