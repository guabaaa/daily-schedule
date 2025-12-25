-- CreateIndex
CREATE INDEX "Schedule_date_startTimeMinutes_idx" ON "Schedule"("date", "startTimeMinutes");

-- CreateIndex
CREATE INDEX "Schedule_date_type_idx" ON "Schedule"("date", "type");

-- CreateIndex
CREATE INDEX "Schedule_date_completed_idx" ON "Schedule"("date", "completed");

-- CreateIndex
CREATE INDEX "Schedule_planId_idx" ON "Schedule"("planId");
